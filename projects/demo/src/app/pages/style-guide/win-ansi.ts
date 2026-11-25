// WinAnsi (Windows-1252) encoding of PDF text: enough for French with the standard and
// embedded fonts.

// Characters of Windows-1252 outside Latin-1, with their byte.
export const WIN_ANSI: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  ƒ: 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  ˆ: 0x88,
  '‰': 0x89,
  Š: 0x8a,
  '‹': 0x8b,
  Œ: 0x8c,
  Ž: 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  š: 0x9a,
  '›': 0x9b,
  œ: 0x9c,
  ž: 0x9e,
  Ÿ: 0x9f,
};

const REPLACEMENTS: [RegExp, string][] = [
  [/≥/g, '>='],
  [/≤/g, '<='],
  [/[  ]/g, ' '],
  [/→/g, '->'],
];

/** Text as a string of WinAnsi bytes (one char per byte); unknown characters become "?". */
export function encodeWinAnsi(text: string): string {
  let clean = text;
  for (const [from, to] of REPLACEMENTS) clean = clean.replace(from, to);
  let out = '';
  for (const char of clean) {
    const code = char.codePointAt(0)!;
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) out += char;
    else if (char in WIN_ANSI) out += String.fromCharCode(WIN_ANSI[char]);
    else out += '?';
  }
  return out;
}
