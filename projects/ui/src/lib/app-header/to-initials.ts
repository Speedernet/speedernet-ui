/**
 * Initials shown in the user avatar: first letter of the first and last words
 * ("Élodie de la Tour" gives "ÉT"), a single letter for a single word, "?" when no word has a
 * letter. Each word contributes its first Unicode letter, so punctuation is skipped
 * ("« Camille »" gives "C") and words without letters ("42", "-") are ignored.
 */
export function toInitials(displayName: string): string {
  const letters = displayName
    .normalize('NFC')
    .split(/\s+/)
    .map(firstLetter)
    .filter((letter) => letter !== null);
  if (letters.length === 0) return '?';
  const last = letters.length > 1 ? letters[letters.length - 1] : '';
  return (letters[0] + last).toLocaleUpperCase('fr');
}

/** First Unicode letter of a word, or null when it has none. */
function firstLetter(word: string): string | null {
  return /\p{L}/u.exec(word)?.[0] ?? null;
}
