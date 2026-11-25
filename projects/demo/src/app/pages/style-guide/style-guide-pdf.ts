// Lays the style guide out as an A4 PDF document: brand colors, interface colors and tints,
// scales, contrasts, typography, spacing, radii and shadows, all from the current tokens.
import { FontWeight, PAGE_HEIGHT, PAGE_WIDTH, PdfFonts, PdfWriter, Rgb } from './pdf-writer';
import { ColorToken, frenchNumber, StyleGuide, toPx } from './style-guide';

const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const BOTTOM = PAGE_HEIGHT - 50;
const WHITE: Rgb = [255, 255, 255];

/** Weight of the embedded fonts closest to a CSS font-weight. */
function closestWeight(cssWeight: string): FontWeight {
  const weight = Number(cssWeight) || 400;
  return ([400, 700, 800] as const).reduce((best, w) =>
    Math.abs(w - weight) < Math.abs(best - weight) ? w : best,
  );
}

/** The style guide as PDF bytes, its text set in the given fonts (Helvetica without them). */
export function styleGuidePdf(guide: StyleGuide, fonts: PdfFonts = {}): Uint8Array {
  const pdf = new PdfWriter('Charte graphique Speedernet', fonts);
  const rgb = (name: string, fallback: Rgb): Rgb =>
    [...guide.brand, ...guide.interface, ...guide.tints].find((c) => c.name === name)?.rgb ??
    fallback;
  const text = rgb('--color-text', [0x31, 0x31, 0x31]);
  const muted = rgb('--color-text-muted', [0x5e, 0x5e, 0x5e]);
  const night = rgb('--color-night', [0x1a, 0x1c, 0x22]);
  const accent = rgb('--color-accent', [0xff, 0xe4, 0x4b]);
  const primary = rgb('--color-primary', [0x0d, 0xc8, 0xd9]);
  const border = rgb('--color-border', [0xe5, 0xe5, 0xe5]);
  const tint = rgb('--tint-primary', [0xcf, 0xf5, 0xfb]);
  const tintBorder = rgb('--tint-primary-border', [0x6c, 0xe6, 0xf5]);
  const radius = toPx(guide.radii.find((r) => r.name === '--radius')?.value ?? '') ?? 10;

  let y = MARGIN;
  const ensure = (height: number) => {
    if (y + height > BOTTOM) {
      pdf.addPage();
      y = MARGIN;
    }
  };
  const heading = (title: string, intro?: string) => {
    ensure(70);
    y += 12;
    // Yellow marker under the lower part of the title, as .speed-highlight does on screen.
    const width = pdf.width(title, 16, 700);
    pdf.rect(MARGIN - 3, y + 9, width + 6, 9, { fill: accent });
    pdf.text(MARGIN, y, title, { size: 16, weight: 700, color: text });
    y += 26;
    if (intro) paragraph(intro, 9, muted);
  };
  const paragraph = (content: string, size = 9, color: Rgb = text, x = MARGIN) => {
    for (const line of pdf.wrap(content, CONTENT_WIDTH - (x - MARGIN), size)) {
      ensure(size * 1.4);
      pdf.text(x, y, line, { size, color });
      y += size * 1.4;
    }
  };
  const label = (x: number, top: number, value: string, size = 7, bold = false, c = text) =>
    pdf.text(x, top, value, { size, weight: bold ? 700 : 400, color: c });

  // Cover band
  pdf.rect(0, 0, PAGE_WIDTH, 120, { fill: night });
  pdf.rect(0, 120, PAGE_WIDTH, 4, { fill: primary });
  pdf.text(MARGIN, 34, 'Charte graphique', { size: 28, weight: 800, color: WHITE });
  pdf.rect(MARGIN, 72, pdf.width('Charte graphique', 28, 800), 3, { fill: accent });
  const date = guide.generatedAt.toLocaleDateString('fr-FR', { dateStyle: 'long' });
  pdf.text(MARGIN, 86, `Speedernet · @speedernet/ui · état du ${date}`, {
    size: 10,
    color: WHITE,
  });
  y = 144;
  paragraph(
    `Couleurs, typographie, espacements, arrondis et ombres de l’écosystème Speedernet, lus dans les variables CSS (tokens) de la bibliothèque @speedernet/ui. Police : ${guide.fontFamily}. Les interfaces n’utilisent que ces tokens, jamais de valeur en dur.`,
    10,
  );

  // Brand colors: large swatches
  heading('Couleurs de la marque');
  const cardWidth = (CONTENT_WIDTH - 4 * 12) / 5;
  guide.brand.forEach((c, i) => {
    const col = i % 5;
    if (col === 0 && i > 0) y += 118;
    if (col === 0) ensure(118);
    const x = MARGIN + col * (cardWidth + 12);
    pdf.rect(x, y, cardWidth, 54, { fill: c.rgb ?? WHITE, stroke: border, radius });
    label(x, y + 60, c.label, 9, true);
    label(x, y + 73, c.name, 7, false, muted);
    label(x, y + 83, c.hex ?? '', 8, true);
    label(x, y + 94, c.reference ? `var(${c.reference})` : c.value, 6, false, muted);
  });
  y += 118;
  for (const c of guide.brand) {
    if (c.role) paragraph(`${c.label} : ${c.role}.`, 8, muted);
  }

  // Interface colors and tints: one row each
  const colorRows = (colors: ColorToken[]) => {
    for (const c of colors) {
      const lines = pdf.wrap(c.role, 210, 7);
      const height = Math.max(24, 12 + lines.length * 9);
      ensure(height);
      pdf.rect(MARGIN, y, 30, 18, { fill: c.rgb ?? WHITE, stroke: border, radius: 4 });
      label(MARGIN + 40, y, c.label, 8, true);
      label(MARGIN + 40, y + 10, c.name, 7, false, muted);
      label(MARGIN + 170, y, c.hex ?? '-', 8, true);
      label(MARGIN + 170, y + 10, c.reference ? `var(${c.reference})` : c.value, 6, false, muted);
      lines.forEach((line, i) => label(MARGIN + 305, y + i * 9, line, 7));
      y += height;
    }
  };
  heading('Couleurs d’interface');
  colorRows(guide.interface);
  heading('Teintes', 'Fonds et bordures pleins des messages, badges et bandeaux.');
  colorRows(guide.tints);

  // Scales
  heading(
    'Échelles de couleurs',
    'Échelles OKLCH de 50 (le plus clair) à 950 (le plus foncé). Le pas encadré est la couleur de marque ; « Aa » montre la couleur de texte lisible et son contraste.',
  );
  for (const scale of guide.scales) {
    const count = scale.steps.length;
    const gap = 4;
    const width = (CONTENT_WIDTH - gap * (count - 1)) / count;
    ensure(100);
    label(MARGIN, y, `${scale.label} · --${scale.name}-*`, 10, true);
    y += 16;
    scale.steps.forEach((s, i) => {
      const x = MARGIN + i * (width + gap);
      const ink = s.text === 'light' ? WHITE : text;
      if (s.step === scale.anchor) {
        pdf.rect(x - 2, y - 2, width + 4, 48, { stroke: text, lineWidth: 1.5, radius: 6 });
      }
      pdf.rect(x, y, width, 44, { fill: s.token.rgb ?? WHITE, radius: 4 });
      label(x + 4, y + 4, String(s.step), 7, true, ink);
      label(x + 4, y + 24, 'Aa', 11, true, ink);
      label(x, y + 50, s.token.hex ?? '', 6.5, true);
      label(x, y + 59, `${frenchNumber(s.ratio)}:1`, 6, false, muted);
    });
    y += 78;
  }

  // Contrasts
  heading(
    'Associations de couleurs autorisées',
    'Contrastes WCAG calculés à partir des tokens actuels : 4,5:1 minimum pour le texte, 3:1 pour le gros texte et les éléments graphiques.',
  );
  for (const p of guide.contrasts) {
    ensure(34);
    pdf.rect(MARGIN, y, 46, 26, { fill: p.background.rgb!, stroke: border, radius: 4 });
    label(MARGIN + 13, y + 7, 'Aa', 11, true, p.foreground.rgb!);
    label(MARGIN + 56, y + 2, `${p.foreground.name} sur ${p.background.name}`, 8, true);
    label(
      MARGIN + 56,
      y + 13,
      `${p.foreground.hex} sur ${p.background.hex} · ${p.usage}`,
      7,
      false,
      muted,
    );
    label(MARGIN + 420, y + 2, `${frenchNumber(p.ratio)}:1`, 10, true);
    label(MARGIN + 420, y + 15, p.level, 7, false, muted);
    y += 34;
  }

  // Typography
  heading(
    'Typographie',
    pdf.embedsFonts
      ? `Police ${guide.fontFamily}. Les exemples ci-dessous sont rendus dans cette police, aux tailles et graisses de la charte.`
      : `Police ${guide.fontFamily}. La police n’a pas pu être chargée : les exemples ci-dessous sont rendus en Helvetica, aux tailles de la charte.`,
  );
  for (const t of guide.typography) {
    const px = toPx(t.fontSize) ?? 16;
    ensure(px + 26);
    const screen = t.media
      ? ` · à partir de ${t.media.replace(/[()]/g, '').replace('min-width: ', '')}`
      : '';
    pdf.text(MARGIN, y, `${t.label}${screen}`, {
      size: px * 0.75,
      weight: closestWeight(t.fontWeight),
      color: text,
    });
    y += px * 0.75 * 1.3;
    label(
      MARGIN,
      y,
      `${t.selector} · ${t.fontSize} (${frenchNumber(px, 0)} px) · interligne ${t.lineHeight} · graisse ${t.fontWeight}`,
      7,
      false,
      muted,
    );
    y += 16;
  }
  if (guide.highlight) {
    ensure(40);
    const sample = 'Mot surligné';
    pdf.rect(MARGIN - 3, y + 9, pdf.width(sample, 16, 800) + 6, 9, { fill: accent });
    pdf.text(MARGIN, y, sample, { size: 16, weight: 800, color: text });
    y += 24;
    const css = Object.entries(guide.highlight.declarations)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' ; ');
    paragraph(`Classe .speed-highlight, sur un ou deux mots de chaque titre 1 : ${css}.`, 7, muted);
  }

  // Spacing and radii
  heading('Espacements');
  for (const s of guide.spacing) {
    ensure(18);
    pdf.rect(MARGIN, y + 1, Math.max(1, s.px ?? 0), 10, { fill: primary });
    label(MARGIN + 60, y + 2, `${s.name} · ${s.value} · ${s.px ?? '-'} px`, 8);
    y += 18;
  }
  heading('Arrondis');
  ensure(90);
  guide.radii.forEach((r, i) => {
    const x = MARGIN + i * 170;
    pdf.rect(x, y, 120, 60, { fill: tint, stroke: tintBorder, radius: r.px ?? 0 });
    label(x, y + 66, `${r.name} · ${r.value}`, 8, true);
    pdf.wrap(r.label, 160, 7).forEach((line, j) => label(x, y + 77 + j * 9, line, 7, false, muted));
  });
  y += 100;

  heading('Ombres, effets et autres tokens');
  for (const t of [...guide.shadows, ...guide.others]) {
    ensure(22);
    label(MARGIN, y, t.name, 8, true);
    paragraph(t.value.replace(/\s+/g, ' '), 7, muted, MARGIN + 150);
    y += 6;
  }

  // Footers, once the page count is known
  for (let i = 1; i <= pdf.pageCount; i++) {
    pdf.onPage(i, () => {
      pdf.rect(MARGIN, PAGE_HEIGHT - 34, CONTENT_WIDTH, 0.5, { fill: border });
      pdf.text(MARGIN, PAGE_HEIGHT - 28, `Charte graphique Speedernet · ${date}`, {
        size: 7,
        color: muted,
      });
      const pageLabel = `${i} / ${pdf.pageCount}`;
      pdf.text(PAGE_WIDTH - MARGIN - pdf.width(pageLabel, 7), PAGE_HEIGHT - 28, pageLabel, {
        size: 7,
        color: muted,
      });
    });
  }
  return pdf.toBytes();
}
