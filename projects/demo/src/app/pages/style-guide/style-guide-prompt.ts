// The style guide for AI agents. styleGuidePrompt writes the whole guide in Markdown (principles,
// every color with its token and hex value, contrasts, typography, spacing, radii, shadows and the
// full :root block), shown by the /charte-graphique page; creationPrompt is the prompt the
// foundations page copies: the user's request, then an instruction to read that page.
import { ColorToken, frenchNumber, StyleGuide } from './style-guide';

export function styleGuidePrompt(guide: StyleGuide): string {
  const lines: string[] = [];
  const add = (...text: string[]) => lines.push(...text);
  const date = guide.generatedAt.toLocaleDateString('fr-FR', { dateStyle: 'long' });

  add(
    '# Charte graphique Speedernet',
    '',
    `Tu conçois ou développes une interface pour Speedernet. Applique strictement la charte graphique ci-dessous (état du ${date}, bibliothèque Angular \`@speedernet/ui\`). Les valeurs viennent directement des variables CSS (tokens) de la bibliothèque.`,
    '',
    '## Règles générales',
    '',
    '- Utilise uniquement les tokens (variables CSS) ci-dessous, jamais de couleur, taille ou espacement en dur : `color: var(--color-text)`, pas `#313131`.',
    `- Police unique : ${guide.fontFamily || 'Mulish'}. Graisses utilisées : 400 (texte), 700 (titres 2 et 3, liens, libellés), 800 (titre 1, en-têtes de tableau).`,
    '- Fond de page `--color-background`, contenus posés sur des surfaces blanches `--color-surface` (cartes, tableaux, champs, boîtes de dialogue).',
    '- Chaque page a un seul titre 1, dont un ou deux mots sont surlignés en jaune avec la classe `.speed-highlight`.',
    '- Contraste WCAG 2.1 AA au minimum : 4,5:1 pour le texte, 3:1 pour le gros texte et les éléments graphiques (contours de champs, icônes). Le cyan primaire et le jaune ne portent jamais de texte blanc.',
    guide.breakpoints.length
      ? `- Approche « mobile d’abord » : styles pour petit écran, élargis par des requêtes \`min-width\` à partir de ${guide.breakpoints.map((b) => `${b} px`).join(', ')}.`
      : '- Approche « mobile d’abord » : styles pour petit écran, élargis par des requêtes `min-width`.',
    '- Les composants, directives, services et classes CSS de la bibliothèque portent le préfixe `speed` (`SpeedButton`, `<speed-field>`, `.speed-container`).',
    '- Textes de l’interface en français.',
    '',
  );

  add('## Couleurs de la marque', '', ...colorTable(guide.brand), '');
  add('## Couleurs d’interface', '', ...colorTable(guide.interface), '');
  add(
    '## Teintes',
    '',
    'Fonds et bordures pleins (sans transparence) des messages, badges et bandeaux.',
    '',
    ...colorTable(guide.tints),
    '',
  );

  add(
    '## Échelles de couleurs',
    '',
    'Échelles OKLCH de 50 (le plus clair) à 950 (le plus foncé). Le pas marqué « marque » est la couleur de marque de l’échelle. « clair » ou « foncé » indique la couleur de texte lisible sur le pas.',
    '',
  );
  for (const scale of guide.scales) {
    add(`### ${scale.label} (\`--${scale.name}-*\`)`, '');
    add('| Pas | Token | Hexa | OKLCH | Texte lisible |', '| --- | --- | --- | --- | --- |');
    for (const s of scale.steps) {
      const anchor = s.step === scale.anchor ? ' (marque)' : '';
      const text = `${s.text === 'dark' ? 'foncé' : 'clair'} ${frenchNumber(s.ratio)}:1`;
      add(
        `| ${s.step}${anchor} | \`${s.token.name}\` | ${s.token.hex} | \`${s.token.value}\` | ${text} |`,
      );
    }
    add('');
  }

  add(
    '## Associations de couleurs autorisées',
    '',
    'Contrastes calculés à partir des tokens actuels.',
    '',
    '| Premier plan | Arrière-plan | Contraste | Niveau | Usage |',
    '| --- | --- | --- | --- | --- |',
    ...guide.contrasts.map(
      (p) =>
        `| \`${p.foreground.name}\` (${p.foreground.hex}) | \`${p.background.name}\` (${p.background.hex}) | ${frenchNumber(p.ratio)}:1 | ${p.level} | ${p.usage} |`,
    ),
    '',
  );

  add('## Typographie', '', `Police : \`${guide.fontFamily}\` (\`--font-family-base\`).`, '');
  add('| Élément | Écran | Taille | Interligne | Graisse |', '| --- | --- | --- | --- | --- |');
  for (const t of guide.typography) {
    const screen = t.media
      ? `à partir de ${t.media.replace(/[()]/g, '').replace('min-width: ', '')}`
      : 'tous';
    add(
      `| ${t.label} (\`${t.selector}\`) | ${screen} | ${t.fontSize} | ${t.lineHeight} | ${t.fontWeight} |`,
    );
  }
  if (guide.highlight) {
    const css = Object.entries(guide.highlight.declarations)
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ');
    add('', `Surlignage des titres, classe \`.speed-highlight\` : \`${css}\``);
  }
  add('');

  add(
    '## Espacements',
    '',
    '| Token | Valeur | Pixels |',
    '| --- | --- | --- |',
    ...guide.spacing.map((s) => `| \`${s.name}\` | ${s.value} | ${s.px ?? '-'} px |`),
    '',
    '## Arrondis',
    '',
    '| Token | Valeur | Usage |',
    '| --- | --- | --- |',
    ...guide.radii.map((r) => `| \`${r.name}\` | ${r.value} | ${r.label} |`),
    '',
    '## Ombres et effets',
    '',
    ...guide.shadows.map((s) => `- \`${s.name}\` : \`${oneLine(s.value)}\``),
    '',
  );
  if (guide.others.length) {
    add(
      '## Autres tokens',
      '',
      ...guide.others.map((t) => `- \`${t.name}\` : \`${oneLine(t.value)}\``),
      '',
    );
  }

  add(
    '## Variables CSS complètes',
    '',
    'À reprendre telles quelles si la bibliothèque `@speedernet/ui` n’est pas disponible.',
    '',
    '```css',
    ':root {',
    ...guide.tokens.map((t) => `  ${t.name}: ${oneLine(t.declared)};`),
    '}',
    '```',
  );
  return lines.join('\n') + '\n';
}

function colorTable(colors: ColorToken[]): string[] {
  return [
    '| Nom | Token | Hexa | Valeur | Usage |',
    '| --- | --- | --- | --- | --- |',
    ...colors.map((c) => {
      const value = c.reference ? `\`var(${c.reference})\`` : `\`${oneLine(c.value)}\``;
      return `| ${c.label} | \`${c.name}\` | ${c.hex ?? '-'} | ${value} | ${c.role} |`;
    }),
  ];
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Pages of the demo an agent can read, relative to its base URL. */
export const AGENT_PAGES = {
  guide: 'charte-graphique',
  foundations: 'fondations',
  components: 'composants',
  screen: 'ecran-type',
};

/**
 * Prompt for an AI agent: the user's request first, then an instruction to read the up-to-date
 * style guide on the demo application rather than carrying the whole guide, so the agent always
 * gets the current tokens.
 */
export function creationPrompt(request: string, baseUrl: string): string {
  const url = (path: string) => new URL(path, baseUrl).href;
  return [
    request.trim(),
    '',
    '---',
    '',
    'Pour réaliser cette demande, applique strictement la charte graphique Speedernet. Avant de commencer, consulte-la dans sa version à jour, sur l’application de démonstration de la bibliothèque Angular `@speedernet/ui` :',
    '',
    `1. Lis ${url(AGENT_PAGES.guide)} : la charte complète en texte (règles générales, couleurs avec leur token et leur valeur hexa, échelles, associations de couleurs et contrastes, typographie, espacements, arrondis, ombres et bloc complet des variables CSS). Les valeurs y sont lues en direct dans les tokens de la bibliothèque : c’est la source de vérité.`,
    `2. Si besoin, complète avec ${url(AGENT_PAGES.foundations)} (aperçu visuel des couleurs, de la typographie et des logos), ${url(AGENT_PAGES.components)} (composants disponibles, variantes et usages) et ${url(AGENT_PAGES.screen)} (exemple d’écran complet).`,
    '',
    'L’application est rendue en JavaScript : ouvre ces pages avec un outil de navigateur et lis le texte affiché. Une simple requête HTTP ne renvoie qu’une page vide.',
    '',
    'N’utilise que les couleurs, la police, les espacements et les arrondis de la charte, et respecte ses associations de couleurs. Pour une interface web, utilise les tokens (variables CSS) et les composants `speed` de la bibliothèque, jamais de valeur en dur. Si tu ne peux pas ouvrir ces pages, dis-le-moi au lieu d’inventer des valeurs.',
    '',
  ].join('\n');
}
