// Reads the style guide from the page itself: every CSS custom property declared on :root by the
// loaded stylesheets (the @speedernet/ui tokens) and the typography rules. Nothing is hard-coded
// but the French labels, so a new or changed token shows up in the PDF and the prompt.
import { contrast, contrastLevel, parseColor, toHex } from '../color';

export interface Token {
  /** Name with its leading "--", e.g. "--color-text". */
  name: string;
  /** Value as written in the stylesheet, e.g. "var(--gray-900)". */
  declared: string;
  /** Value once var() references are resolved, e.g. "oklch(31.3% 0 0)". */
  value: string;
}

export interface CssRule {
  selector: string;
  /** Media condition the rule sits in, e.g. "(min-width: 960px)", or null. */
  media: string | null;
  declarations: Record<string, string>;
}

export interface ColorToken extends Token {
  label: string;
  role: string;
  /** Token this one points to, e.g. "--gray-900", or null for a raw value. */
  reference: string | null;
  hex: string | null;
  rgb: number[] | null;
}

export interface ScaleStep {
  step: number;
  token: ColorToken;
  /** Readable text color on the step and its contrast. */
  text: 'dark' | 'light';
  ratio: number;
}

export interface Scale {
  name: string;
  label: string;
  steps: ScaleStep[];
  /** Step referenced by a brand color, if any. */
  anchor: number | null;
}

export interface ContrastPair {
  foreground: ColorToken;
  background: ColorToken;
  ratio: number;
  level: string;
  usage: string;
}

export interface SizeToken extends Token {
  label: string;
  /** Size in CSS pixels (1rem = 16px), or null when it is not a length. */
  px: number | null;
}

export interface TypeStyle {
  label: string;
  selector: string;
  media: string | null;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
}

export interface StyleGuide {
  generatedAt: Date;
  fontFamily: string;
  brand: ColorToken[];
  interface: ColorToken[];
  tints: ColorToken[];
  scales: Scale[];
  contrasts: ContrastPair[];
  typography: TypeStyle[];
  highlight: CssRule | null;
  /** Widths of the min-width media queries used by the stylesheets, e.g. [600, 960]. */
  breakpoints: number[];
  spacing: SizeToken[];
  radii: SizeToken[];
  shadows: Token[];
  others: Token[];
  /** Every token, in declaration order. */
  tokens: Token[];
}

const BRAND = [
  '--color-text',
  '--color-night',
  '--color-primary',
  '--color-accent',
  '--color-brand',
];

const COLOR_LABELS: Record<string, [label: string, role: string]> = {
  '--color-text': [
    'Texte',
    'Texte courant, titres, fond des boutons principaux et des en-têtes de tableau',
  ],
  '--color-night': ['Nuit', 'Fonds sombres, survol des boutons principaux'],
  '--color-primary': [
    'Primaire',
    'Cyan de la marque : éléments graphiques, barres, illustrations (pas de texte)',
  ],
  '--color-accent': ['Accent', 'Jaune de la marque : surlignage des titres, badges'],
  '--color-brand': ['Marque', 'Rouge de la marque : touches graphiques'],
  '--color-background': ['Fond de page', 'Arrière-plan de toutes les pages'],
  '--color-surface': ['Surface', 'Cartes, champs, tableaux, boîtes de dialogue'],
  '--color-on-dark': ['Sur fond sombre', 'Texte et icônes sur les fonds sombres'],
  '--color-text-muted': ['Texte secondaire', 'Aides, mentions, textes désactivés'],
  '--color-border': ['Bordure', 'Séparateurs, contours des cartes et tableaux'],
  '--color-border-strong': ['Bordure forte', 'Contour des champs et des boutons secondaires'],
  '--color-danger': ['Danger', 'Erreurs, bouton de suppression'],
  '--color-disabled': ['Désactivé', 'Fond des éléments désactivés'],
  '--color-backdrop': ['Voile', 'Arrière-plan des boîtes de dialogue modales'],
  '--tint-primary': ['Teinte primaire', 'Fond des messages et badges d’information'],
  '--tint-primary-border': [
    'Bordure teinte primaire',
    'Bordure des messages d’information, halo de focus des champs',
  ],
  '--tint-primary-subtle': ['Teinte primaire légère', 'Survol des lignes de tableau'],
  '--tint-accent': ['Teinte accent', 'Fond des messages d’avertissement'],
  '--tint-accent-border': ['Bordure teinte accent', 'Bordure des messages d’avertissement'],
  '--tint-brand': ['Teinte marque', 'Fond des messages d’erreur'],
  '--tint-brand-border': ['Bordure teinte marque', 'Bordure des messages d’erreur'],
  '--tint-neutral': ['Teinte neutre', 'Fond des badges neutres'],
  '--tint-neutral-border': ['Bordure teinte neutre', 'Bordure des badges neutres'],
  '--tint-highlight': ['Surlignage', 'Survol des liens'],
};

const SCALE_LABELS: Record<string, string> = {
  cyan: 'Cyan',
  yellow: 'Jaune',
  red: 'Rouge',
  night: 'Nuit',
  gray: 'Gris',
};

/** Pairs checked for contrast: [foreground, background, usage]. */
const PAIRS: [string, string, string][] = [
  ['--color-text', '--color-surface', 'Texte courant'],
  ['--color-text', '--color-background', 'Texte sur le fond de page'],
  ['--color-text-muted', '--color-surface', 'Aides, mentions'],
  ['--color-text-muted', '--color-background', 'Mentions sur le fond de page'],
  ['--color-on-dark', '--color-text', 'Bouton principal, en-têtes de tableau'],
  ['--color-on-dark', '--color-night', 'Bouton principal au survol, fonds sombres'],
  ['--color-on-dark', '--color-danger', 'Bouton de suppression'],
  ['--color-text', '--color-accent', 'Surlignage des titres, badges jaunes'],
  ['--color-text', '--tint-primary', 'Messages et badges d’information'],
  ['--color-text', '--tint-accent', 'Messages d’avertissement'],
  ['--color-text', '--tint-brand', 'Messages d’erreur'],
  ['--color-text', '--tint-neutral', 'Badges neutres'],
  ['--color-border-strong', '--color-surface', 'Contour des champs (élément graphique)'],
  ['--color-danger', '--color-surface', 'Texte et bordure d’erreur'],
];

const TYPE_SELECTORS: Record<string, string> = {
  h1: 'Titre 1',
  h2: 'Titre 2',
  h3: 'Titre 3',
  body: 'Texte courant',
};

/** Reads the tokens and rules from the stylesheets of a document. */
export function readStyleGuide(doc: Document = document): StyleGuide {
  const declared = new Map<string, string>();
  const rules: CssRule[] = [];
  const visit = (list: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(list)) {
      if ('selectorText' in rule && 'style' in rule) {
        const style = (rule as CSSStyleRule).style;
        const selector = (rule as CSSStyleRule).selectorText.trim();
        // Declarations as written: shorthands with var() (background: var(...)) stay whole,
        // where the longhands the browser lists would be empty.
        const declarations: Record<string, string> = {};
        for (const part of style.cssText.split(';')) {
          const colon = part.indexOf(':');
          if (colon > 0) declarations[part.slice(0, colon).trim()] = part.slice(colon + 1).trim();
        }
        if (selector === ':root' && media === null) {
          for (const property of Array.from(style)) {
            if (property.startsWith('--')) {
              declared.set(property, style.getPropertyValue(property).trim());
            }
          }
        }
        rules.push({ selector, media, declarations });
      } else if ('cssRules' in rule) {
        const condition = 'conditionText' in rule ? String(rule.conditionText) : null;
        visit((rule as CSSGroupingRule).cssRules, condition ?? media);
      }
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      visit(sheet.cssRules, null);
    } catch {
      // Cross-origin stylesheet: its rules can't be read, and it holds no token.
    }
  }
  const computed = getComputedStyle(doc.documentElement);
  const tokens = [...declared].map(([name, value]) => ({
    name,
    declared: value,
    value: computed.getPropertyValue(name).trim() || value,
  }));
  return buildStyleGuide(tokens, rules);
}

/** Sorts the tokens and rules into the sections of the style guide. */
export function buildStyleGuide(tokens: Token[], rules: CssRule[], now = new Date()): StyleGuide {
  const byName = new Map(tokens.map((t) => [t.name, t]));
  const used = new Set<string>();
  const take = (filter: (t: Token) => boolean) => {
    const found = tokens.filter((t) => !used.has(t.name) && filter(t));
    found.forEach((t) => used.add(t.name));
    return found;
  };

  const color = (t: Token): ColorToken => {
    const rgb = parseColor(t.value);
    const [label, role] = COLOR_LABELS[t.name] ?? [humanize(t.name), ''];
    return {
      ...t,
      label,
      role,
      reference: t.declared.match(/^var\((--[\w-]+)\)$/)?.[1] ?? null,
      hex: rgb ? toHex(rgb) : null,
      rgb,
    };
  };

  const scaleTokens = take((t) => /^--[a-z]+-\d+$/.test(t.name) && parseColor(t.value) !== null);
  const brand = BRAND.filter((n) => byName.has(n)).map((n) => color(byName.get(n)!));
  brand.forEach((t) => used.add(t.name));
  const interfaceColors = take((t) => t.name.startsWith('--color-')).map(color);
  const tints = take((t) => t.name.startsWith('--tint-')).map(color);

  const anchors = new Set(brand.map((b) => b.reference).filter(Boolean));
  const scales = new Map<string, Scale>();
  for (const t of scaleTokens) {
    const [, name, step] = t.name.match(/^--([a-z]+)-(\d+)$/)!;
    const scale = scales.get(name) ?? {
      name,
      label: SCALE_LABELS[name] ?? humanize(name),
      steps: [],
      anchor: null,
    };
    const token = color(t);
    const dark = byName.get('--color-text');
    const light = byName.get('--color-on-dark');
    const darkRgb = (dark && parseColor(dark.value)) || [0x31, 0x31, 0x31];
    const lightRgb = (light && parseColor(light.value)) || [255, 255, 255];
    const onDark = contrast(token.rgb!, darkRgb);
    const onLight = contrast(token.rgb!, lightRgb);
    scale.steps.push({
      step: Number(step),
      token,
      text: onDark >= onLight ? 'dark' : 'light',
      ratio: Math.max(onDark, onLight),
    });
    if (anchors.has(t.name)) scale.anchor = Number(step);
    scales.set(name, scale);
  }
  scales.forEach((s) => s.steps.sort((a, b) => a.step - b.step));

  const allColors = new Map(
    [...brand, ...interfaceColors, ...tints].map((c) => [c.name, c] as const),
  );
  const contrasts: ContrastPair[] = [];
  for (const [fg, bg, usage] of PAIRS) {
    const foreground = allColors.get(fg);
    const background = allColors.get(bg);
    if (!foreground?.rgb || !background?.rgb) continue;
    const ratio = contrast(foreground.rgb, background.rgb);
    // Field borders are graphics: WCAG asks 3:1 for them, not the 4.5:1 of text.
    const level =
      fg === '--color-border-strong'
        ? ratio >= 3
          ? 'AA élément graphique'
          : 'insuffisant'
        : contrastLevel(ratio);
    contrasts.push({ foreground, background, ratio, level, usage });
  }

  const size = (t: Token, label: string): SizeToken => ({ ...t, label, px: toPx(t.value) });
  const spacing = take((t) => t.name.startsWith('--space-')).map((t) =>
    size(t, `Espacement ${t.name.slice('--space-'.length)}`),
  );
  const radii = take((t) => t.name.startsWith('--radius')).map((t) =>
    size(t, RADIUS_LABELS[t.name] ?? humanize(t.name)),
  );
  const shadows = take((t) => t.name.startsWith('--shadow') || t.name.startsWith('--sheen'));
  const font = take((t) => t.name.startsWith('--font-family'));
  const others = take(() => true);

  const typography: TypeStyle[] = [];
  for (const rule of rules) {
    const label = TYPE_SELECTORS[rule.selector];
    const d = rule.declarations;
    if (!label || !(d['font-size'] || d['line-height'] || d['font-weight'])) continue;
    const base = typography.find((t) => t.selector === rule.selector && t.media === null);
    typography.push({
      label,
      selector: rule.selector,
      media: rule.media,
      fontSize: d['font-size'] || base?.fontSize || '1rem',
      lineHeight: d['line-height'] || base?.lineHeight || 'normal',
      fontWeight: d['font-weight'] || base?.fontWeight || '400',
    });
  }
  // Titles first, then body text; mobile size before the media query that widens it.
  const order = Object.keys(TYPE_SELECTORS);
  typography.sort(
    (a, b) =>
      order.indexOf(a.selector) - order.indexOf(b.selector) ||
      Number(a.media !== null) - Number(b.media !== null),
  );

  return {
    generatedAt: now,
    fontFamily: font[0]?.value.replace(/\s+/g, ' ') ?? '',
    brand,
    interface: interfaceColors,
    tints,
    scales: [...scales.values()],
    contrasts,
    typography,
    highlight: rules.find((r) => r.selector === '.speed-highlight') ?? null,
    breakpoints: [
      ...new Set(
        rules.flatMap((r) => {
          const width = r.media?.match(/min-width:\s*(\d+)px/)?.[1];
          return width ? [Number(width)] : [];
        }),
      ),
    ].sort((a, b) => a - b),
    spacing,
    radii,
    shadows,
    others: [...font.slice(1), ...others],
    tokens,
  };
}

const RADIUS_LABELS: Record<string, string> = {
  '--radius': 'Arrondi standard (champs, cartes, messages)',
  '--radius-lg': 'Grand arrondi (tableaux, grandes surfaces)',
  '--radius-pill': 'Pilule (boutons, badges)',
};

/** Converts "0.25rem", "10px" or "0" to CSS pixels (1rem = 16px). */
export function toPx(value: string): number | null {
  const match = value.trim().match(/^(-?[\d.]+)(px|rem|em)?$/);
  if (!match) return null;
  const n = Number(match[1]);
  return match[2] === 'rem' || match[2] === 'em' ? n * 16 : n;
}

function humanize(name: string): string {
  const text = name.replace(/^--/, '').replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "1,625" for 1.625, as French numbers are written. */
export function frenchNumber(n: number, digits = 1): string {
  return (Math.floor(n * 10 ** digits) / 10 ** digits).toFixed(digits).replace('.', ',');
}
