// Loads the TrueType files of the style guide font for the PDF. The browser only has the
// variable WOFF2 file of the library, which a PDF can't embed, so the demo serves static
// TrueType instances in public/fonts, named "<Family>-<Style>.ttf" and built by scripts/pdf-fonts.py.
import type { FontWeight, PdfFonts } from './pdf-writer';
import { parseTrueType } from './ttf';

const STYLES: Record<FontWeight, string> = { 400: 'Regular', 700: 'Bold', 800: 'ExtraBold' };

/** First family of a font-family value: "'Mulish', system-ui" gives "Mulish". */
export function firstFamily(fontFamily: string): string {
  return fontFamily
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

/** Fonts of each weight that could be loaded; an empty object means Helvetica. */
export async function loadPdfFonts(fontFamily: string, base = document.baseURI): Promise<PdfFonts> {
  const family = firstFamily(fontFamily).replace(/\s+/g, '');
  const fonts: PdfFonts = {};
  if (!family) return fonts;
  await Promise.all(
    (Object.entries(STYLES) as unknown as [FontWeight, string][]).map(async ([weight, style]) => {
      try {
        const response = await fetch(new URL(`fonts/${family}-${style}.ttf`, base));
        if (!response.ok) return;
        fonts[Number(weight) as FontWeight] = parseTrueType(await response.arrayBuffer());
      } catch {
        // Missing or unreadable file: the closest loaded weight, or Helvetica, takes over.
      }
    }),
  );
  return fonts;
}
