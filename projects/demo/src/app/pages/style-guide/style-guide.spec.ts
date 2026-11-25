import { firstFamily } from './pdf-fonts';
import { encodeWinAnsi, PdfWriter } from './pdf-writer';
import { buildStyleGuide, CssRule, Token } from './style-guide';
import { styleGuidePdf } from './style-guide-pdf';
import { creationPrompt, styleGuidePrompt } from './style-guide-prompt';
import { parseTrueType } from './ttf';

/** Reads a font of the demo from disk (tests run from the repository root, in Node). */
async function readFont(style: string): Promise<ArrayBuffer> {
  const fs = await import(/* @vite-ignore */ 'node:' + 'fs');
  const data: Uint8Array = fs.readFileSync(`projects/demo/public/fonts/Mulish-${style}.ttf`);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

const token = (name: string, declared: string, value = declared): Token => ({
  name,
  declared,
  value,
});

const tokens: Token[] = [
  token('--cyan-500', 'oklch(76.1% 0.129 205.728)'),
  token('--gray-900', 'oklch(31.3% 0 0)'),
  token('--color-text', 'var(--gray-900)', 'oklch(31.3% 0 0)'),
  token('--color-primary', 'var(--cyan-500)', 'oklch(76.1% 0.129 205.728)'),
  token('--color-surface', 'oklch(100% 0 0)'),
  token('--color-on-dark', 'oklch(100% 0 0)'),
  token('--color-new', '#123456'),
  token('--tint-primary', 'var(--cyan-500)', 'oklch(76.1% 0.129 205.728)'),
  token('--font-family-base', "'Mulish', sans-serif"),
  token('--space-1', '0.25rem'),
  token('--radius', '10px'),
  token('--shadow-button', '10px 10px 20px #c0cfe3'),
  token('--header-height', '4.75rem'),
];

const rules: CssRule[] = [
  { selector: 'h1', media: null, declarations: { 'font-size': '1.625rem', 'font-weight': '800' } },
  { selector: 'h1', media: '(min-width: 960px)', declarations: { 'font-size': '2rem' } },
  { selector: '.speed-highlight', media: null, declarations: { padding: '0 4px' } },
];

describe('style guide', () => {
  const guide = buildStyleGuide(tokens, rules, new Date(2026, 10, 12));

  it('sorts the tokens into sections, new tokens included', () => {
    expect(guide.brand.map((c) => c.name)).toEqual(['--color-text', '--color-primary']);
    expect(guide.interface.map((c) => c.name)).toContain('--color-new');
    expect(guide.interface.find((c) => c.name === '--color-new')?.hex).toBe('#123456');
    expect(guide.scales.map((s) => [s.name, s.anchor])).toEqual([
      ['cyan', 500],
      ['gray', 900],
    ]);
    expect(guide.spacing[0].px).toBe(4);
    expect(guide.others.map((t) => t.name)).toEqual(['--header-height']);
    expect(guide.breakpoints).toEqual([960]);
  });

  it('computes the contrasts from the token values', () => {
    const pair = guide.contrasts.find(
      (p) => p.foreground.name === '--color-text' && p.background.name === '--color-surface',
    );
    expect(pair?.ratio).toBeCloseTo(13, 0);
    expect(pair?.level).toBe('AAA');
  });

  it('keeps the desktop title size inherited from the mobile rule', () => {
    expect(guide.typography.map((t) => [t.fontSize, t.fontWeight, t.media])).toEqual([
      ['1.625rem', '800', null],
      ['2rem', '800', '(min-width: 960px)'],
    ]);
  });

  it('writes a prompt with every token and its hex value', () => {
    const prompt = styleGuidePrompt(guide);
    expect(prompt).toContain('# Charte graphique Speedernet');
    expect(prompt).toContain('| Texte | `--color-text` | #313131 | `var(--gray-900)` |');
    expect(prompt).toContain('  --color-new: #123456;');
    expect(prompt).toContain('960 px');
  });

  it('writes a prompt with the request first that sends the agent to the demo pages', () => {
    const prompt = creationPrompt(
      '  Je veux faire des slides sur la rentrée.\n',
      'http://localhost:4200/fondations',
    );
    expect(prompt.startsWith('Je veux faire des slides sur la rentrée.\n')).toBe(true);
    expect(prompt).toContain('http://localhost:4200/charte-graphique');
    expect(prompt).toContain('http://localhost:4200/composants');
    expect(prompt).toContain('outil de navigateur');
    expect(prompt).not.toContain('#313131');
  });

  it('writes a valid PDF', () => {
    const bytes = styleGuidePdf(guide);
    const text = new TextDecoder('latin1').decode(bytes);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(text).toContain('(Charte graphique) Tj');
    // Every xref offset points at its object.
    const xref = text.slice(text.lastIndexOf('xref\n'));
    const offsets = [...xref.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    offsets.forEach((offset, i) => expect(text.startsWith(`${i + 1} 0 obj`, offset)).toBe(true));
  });
});

describe('PDF writer', () => {
  it('encodes French text in WinAnsi', () => {
    expect(encodeWinAnsi('Échelle œuvre ≥ 3 — ok')).toBe('\xc9chelle \x9cuvre >= 3 \x97 ok');
  });

  it('wraps text to a width', () => {
    expect(new PdfWriter().wrap('un deux trois quatre', 40, 10)).toEqual([
      'un deux',
      'trois',
      'quatre',
    ]);
  });

  it('escapes parentheses and backslashes in text', () => {
    const pdf = new PdfWriter();
    pdf.text(0, 0, 'a (b) \\ c');
    expect(new TextDecoder('latin1').decode(pdf.toBytes())).toContain('(a \\(b\\) \\\\ c) Tj');
  });

  it('embeds TrueType fonts with their widths', async () => {
    const regular = parseTrueType(await readFont('Regular'));
    const bold = parseTrueType(await readFont('ExtraBold'));
    expect(regular.postScriptName).toBe('Mulish-Regular');
    expect(regular.widths['M'.charCodeAt(0)]).toBeGreaterThan(regular.widths['i'.charCodeAt(0)]);
    expect(regular.widths[0xe9]).toBeGreaterThan(0); // é
    expect(regular.widths[0x9c]).toBeGreaterThan(0); // œ, a Windows-1252 extra
    expect(bold.widths['a'.charCodeAt(0)]).toBeGreaterThan(regular.widths['a'.charCodeAt(0)]);

    const pdf = new PdfWriter('Test', { 400: regular, 800: bold });
    pdf.text(0, 0, 'Titre', { weight: 800 });
    pdf.text(0, 20, 'Texte', { weight: 700 });
    const text = new TextDecoder('latin1').decode(pdf.toBytes());
    expect(text).toContain('/BaseFont /Mulish-Regular');
    expect(text).toContain('/BaseFont /Mulish-ExtraBold');
    expect(text).toContain('/FontFile2');
    expect(text).not.toContain('Helvetica');
    // 700 is missing: it takes the closest loaded weight, 800.
    expect(text).toMatch(/\/F700 (\d+) 0 R \/F800 \1 0 R/);
  });
});

describe('PDF fonts', () => {
  it('takes the first family of a font stack', () => {
    expect(firstFamily(`"Mulish", system-ui, sans-serif`)).toBe('Mulish');
    expect(firstFamily(`'Segoe UI', Roboto`)).toBe('Segoe UI');
  });
});
