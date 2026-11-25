// Reads what a PDF needs to embed a TrueType font: its PostScript name, vertical metrics and the
// advance width of each WinAnsi character (codes 32 to 255).
import { WIN_ANSI } from './win-ansi';

export interface TrueTypeFont {
  /** The whole font file, embedded as is. */
  bytes: Uint8Array;
  postScriptName: string;
  /** Metrics in 1/1000 em, the unit of PDF font dictionaries. */
  ascent: number;
  descent: number;
  capHeight: number;
  bbox: [number, number, number, number];
  /** Advance widths in 1/1000 em, indexed by WinAnsi code (0 to 255). */
  widths: number[];
}

/** Unicode code point of each WinAnsi byte. */
function winAnsiToUnicode(code: number): number {
  const extra = Object.entries(WIN_ANSI).find(([, byte]) => byte === code);
  return extra ? extra[0].codePointAt(0)! : code;
}

export function parseTrueType(buffer: ArrayBuffer): TrueTypeFont {
  const view = new DataView(buffer);
  const tables = new Map<string, number>();
  const count = view.getUint16(4);
  for (let i = 0; i < count; i++) {
    const record = 12 + i * 16;
    const tag = String.fromCharCode(...new Uint8Array(buffer, record, 4));
    tables.set(tag, view.getUint32(record + 8));
  }
  const table = (tag: string) => {
    const offset = tables.get(tag);
    if (offset === undefined) throw new Error(`TrueType table "${tag}" is missing`);
    return offset;
  };
  if (!tables.has('glyf')) throw new Error('Only TrueType outlines (glyf) can be embedded');

  const head = table('head');
  const unitsPerEm = view.getUint16(head + 18);
  const scale = (v: number) => Math.round((v * 1000) / unitsPerEm);
  const bbox: TrueTypeFont['bbox'] = [
    scale(view.getInt16(head + 36)),
    scale(view.getInt16(head + 38)),
    scale(view.getInt16(head + 40)),
    scale(view.getInt16(head + 42)),
  ];

  const hhea = table('hhea');
  const ascent = scale(view.getInt16(hhea + 4));
  const descent = scale(view.getInt16(hhea + 6));
  const metricCount = view.getUint16(hhea + 34);

  const os2 = tables.get('OS/2');
  const capHeight =
    os2 !== undefined && view.getUint16(os2) >= 2 ? scale(view.getInt16(os2 + 88)) : ascent;

  const hmtx = table('hmtx');
  const advance = (glyph: number) => view.getUint16(hmtx + 4 * Math.min(glyph, metricCount - 1));

  const glyphOf = readCmap(view, table('cmap'));
  const widths: number[] = [];
  for (let code = 0; code < 256; code++) {
    const glyph = glyphOf(winAnsiToUnicode(code));
    widths.push(glyph ? scale(advance(glyph)) : 0);
  }

  return {
    bytes: new Uint8Array(buffer),
    postScriptName: readPostScriptName(view, table('name')) ?? 'EmbeddedFont',
    ascent,
    descent,
    capHeight,
    bbox,
    widths,
  };
}

/** Glyph lookup from the Unicode BMP subtable (format 4) of the cmap table. */
function readCmap(view: DataView, cmap: number): (codePoint: number) => number {
  const count = view.getUint16(cmap + 2);
  let subtable = -1;
  for (let i = 0; i < count; i++) {
    const record = cmap + 4 + i * 8;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const offset = cmap + view.getUint32(record + 4);
    if (view.getUint16(offset) === 4 && (platform === 0 || (platform === 3 && encoding === 1))) {
      subtable = offset;
      break;
    }
  }
  if (subtable < 0) throw new Error('No Unicode cmap (format 4) in the font');
  const segments = view.getUint16(subtable + 6) / 2;
  const ends = subtable + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const rangeOffsets = deltas + segments * 2;
  return (codePoint) => {
    if (codePoint > 0xffff) return 0;
    for (let i = 0; i < segments; i++) {
      if (codePoint > view.getUint16(ends + i * 2)) continue;
      const start = view.getUint16(starts + i * 2);
      if (codePoint < start) return 0;
      const delta = view.getInt16(deltas + i * 2);
      const rangeOffset = view.getUint16(rangeOffsets + i * 2);
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
      const glyph = view.getUint16(rangeOffsets + i * 2 + rangeOffset + (codePoint - start) * 2);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };
}

/** Name ID 6 (PostScript name), from a Windows (UTF-16) or Macintosh (ASCII) record. */
function readPostScriptName(view: DataView, name: number): string | null {
  const count = view.getUint16(name + 2);
  const strings = name + view.getUint16(name + 4);
  for (let i = 0; i < count; i++) {
    const record = name + 6 + i * 12;
    if (view.getUint16(record + 6) !== 6) continue;
    const platform = view.getUint16(record);
    const length = view.getUint16(record + 8);
    const offset = strings + view.getUint16(record + 10);
    let text = '';
    if (platform === 3 || platform === 0) {
      for (let j = 0; j < length; j += 2) text += String.fromCharCode(view.getUint16(offset + j));
    } else {
      for (let j = 0; j < length; j++) text += String.fromCharCode(view.getUint8(offset + j));
    }
    // PDF names can't hold spaces or delimiters.
    return text.replace(/[^\w-]/g, '');
  }
  return null;
}
