// Minimal PDF writer for the style guide: A4 pages, text in embedded TrueType fonts (or Helvetica
// when none is given) with WinAnsi encoding, enough for French, filled and stroked rectangles
// with optional rounded corners. Coordinates are in points from the top left corner of the page.
import type { TrueTypeFont } from './ttf';
import { encodeWinAnsi } from './win-ansi';

export { encodeWinAnsi } from './win-ansi';

export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;

export type Rgb = readonly number[];

/** Font weights the writer knows: regular, bold and extra bold. */
export type FontWeight = 400 | 700 | 800;

/** TrueType fonts to embed, by weight; a missing weight falls back to the closest one. */
export type PdfFonts = Partial<Record<FontWeight, TrueTypeFont>>;

export interface TextOptions {
  size?: number;
  weight?: FontWeight;
  color?: Rgb;
}

export interface RectOptions {
  fill?: Rgb;
  stroke?: Rgb;
  lineWidth?: number;
  radius?: number;
}

// Helvetica advance widths (1/1000 em) for the characters 32 to 126, used without embedded fonts.
// prettier-ignore
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const num = (n: number) => (Math.round(n * 100) / 100).toString();
const color = (c: Rgb) => c.map((v) => num(v / 255)).join(' ');
const escape = (text: string) => text.replace(/[\\()]/g, (m) => '\\' + m);
const WEIGHTS: FontWeight[] = [400, 700, 800];

export class PdfWriter {
  private readonly pages: string[][] = [];
  private current: string[] = [];

  constructor(
    private readonly title = '',
    private readonly fonts: PdfFonts = {},
  ) {
    this.addPage();
  }

  get pageCount(): number {
    return this.pages.length;
  }

  /** Whether text is drawn with embedded fonts rather than Helvetica. */
  get embedsFonts(): boolean {
    return WEIGHTS.some((w) => this.fonts[w]);
  }

  addPage(): void {
    this.current = [];
    this.pages.push(this.current);
  }

  /** Runs drawing calls on an earlier page (1-based), e.g. to add footers once all pages exist. */
  onPage(index: number, draw: () => void): void {
    const saved = this.current;
    this.current = this.pages[index - 1];
    draw();
    this.current = saved;
  }

  /** Embedded font for a weight: that weight, else the closest one given. */
  private font(weight: FontWeight): TrueTypeFont | undefined {
    const byDistance = [...WEIGHTS].sort((a, b) => Math.abs(a - weight) - Math.abs(b - weight));
    return byDistance.map((w) => this.fonts[w]).find(Boolean);
  }

  /** Width of a text in points. */
  width(text: string, size: number, weight: FontWeight = 400): number {
    const font = this.font(weight);
    let units = 0;
    if (font) {
      for (const byte of encodeWinAnsi(text)) units += font.widths[byte.charCodeAt(0)];
      return (units / 1000) * size;
    }
    for (const char of text) {
      const base = char.normalize('NFD').charCodeAt(0);
      units += base >= 32 && base <= 126 ? HELVETICA[base - 32] : 556;
    }
    // Helvetica-Bold is about 7 % wider than Helvetica.
    return (units / 1000) * size * (weight >= 700 ? 1.07 : 1);
  }

  /** Splits a text into lines that fit a width. */
  wrap(text: string, width: number, size: number, weight: FontWeight = 400): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && this.width(candidate, size, weight) > width) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  text(x: number, y: number, text: string, options: TextOptions = {}): void {
    const { size = 10, weight = 400, color: c = [0x31, 0x31, 0x31] } = options;
    const font = this.embedsFonts ? `F${weight}` : weight >= 700 ? 'F700' : 'F400';
    // y is the top of the line: the baseline sits about 0.8 em lower.
    const baseline = PAGE_HEIGHT - y - size * 0.8;
    this.current.push(
      `BT ${color(c)} rg /${font} ${num(size)} Tf ${num(x)} ${num(baseline)} Td (${escape(encodeWinAnsi(text))}) Tj ET`,
    );
  }

  rect(x: number, y: number, width: number, height: number, options: RectOptions = {}): void {
    const { fill, stroke, lineWidth = 0.75, radius = 0 } = options;
    if (!fill && !stroke) return;
    const ops: string[] = ['q'];
    if (fill) ops.push(`${color(fill)} rg`);
    if (stroke) ops.push(`${color(stroke)} RG ${num(lineWidth)} w`);
    const bottom = PAGE_HEIGHT - y - height;
    const r = Math.min(radius, width / 2, height / 2);
    if (r <= 0) {
      ops.push(`${num(x)} ${num(bottom)} ${num(width)} ${num(height)} re`);
    } else {
      // Rounded corners as cubic Bézier quarter circles.
      const k = r * 0.5523;
      const [l, b, rt, t] = [x, bottom, x + width, bottom + height];
      ops.push(
        `${num(l + r)} ${num(b)} m`,
        `${num(rt - r)} ${num(b)} l`,
        `${num(rt - r + k)} ${num(b)} ${num(rt)} ${num(b + r - k)} ${num(rt)} ${num(b + r)} c`,
        `${num(rt)} ${num(t - r)} l`,
        `${num(rt)} ${num(t - r + k)} ${num(rt - r + k)} ${num(t)} ${num(rt - r)} ${num(t)} c`,
        `${num(l + r)} ${num(t)} l`,
        `${num(l + r - k)} ${num(t)} ${num(l)} ${num(t - r + k)} ${num(l)} ${num(t - r)} c`,
        `${num(l)} ${num(b + r)} l`,
        `${num(l)} ${num(b + r - k)} ${num(l + r - k)} ${num(b)} ${num(l + r)} ${num(b)} c`,
        'h',
      );
    }
    ops.push(fill && stroke ? 'B' : fill ? 'f' : 'S', 'Q');
    this.current.push(ops.join(' '));
  }

  /** The document as PDF bytes. */
  toBytes(): Uint8Array {
    const objects: string[] = [];
    // Returns the object number: its 1-based position.
    const add = (body: string) => objects.push(body);
    add('<< /Type /Catalog /Pages 2 0 R >>');
    add(''); // Pages, filled once the page objects are numbered

    // One font resource per weight: /F400, /F700, /F800.
    const resources: string[] = [];
    if (this.embedsFonts) {
      const embedded = new Map<TrueTypeFont, number>();
      for (const weight of WEIGHTS) {
        const font = this.font(weight)!;
        if (!embedded.has(font)) embedded.set(font, add(trueTypeFont(font, add)));
        resources.push(`/F${weight} ${embedded.get(font)} 0 R`);
      }
    } else {
      const regular = add(standardFont('Helvetica'));
      const bold = add(standardFont('Helvetica-Bold'));
      resources.push(`/F400 ${regular} 0 R`, `/F700 ${bold} 0 R`);
    }

    const kids: string[] = [];
    for (const page of this.pages) {
      const content = page.join('\n');
      const contentId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      const pageId = add(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
          `/Resources << /Font << ${resources.join(' ')} >> >> /Contents ${contentId} 0 R >>`,
      );
      kids.push(`${pageId} 0 R`);
    }
    objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
    const infoId = add(
      `<< /Title (${escape(encodeWinAnsi(this.title))}) /Producer (@speedernet/ui demo) >>`,
    );

    let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
    const offsets: number[] = [];
    objects.forEach((body, i) => {
      offsets.push(out.length);
      out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }
}

function standardFont(name: string): string {
  return `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`;
}

/** Writes the font file and descriptor objects and returns the font dictionary. */
function trueTypeFont(font: TrueTypeFont, add: (body: string) => number): string {
  let data = '';
  for (const byte of font.bytes) data += String.fromCharCode(byte);
  const file = add(
    `<< /Length ${data.length} /Length1 ${data.length} >>\nstream\n${data}\nendstream`,
  );
  const descriptor = add(
    `<< /Type /FontDescriptor /FontName /${font.postScriptName} /Flags 32 ` +
      `/FontBBox [${font.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${font.ascent} ` +
      `/Descent ${font.descent} /CapHeight ${font.capHeight} /StemV 80 /FontFile2 ${file} 0 R >>`,
  );
  return (
    `<< /Type /Font /Subtype /TrueType /BaseFont /${font.postScriptName} /FirstChar 32 ` +
    `/LastChar 255 /Widths [${font.widths.slice(32).join(' ')}] /Encoding /WinAnsiEncoding ` +
    `/FontDescriptor ${descriptor} 0 R >>`
  );
}
