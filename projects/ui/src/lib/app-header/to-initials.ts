/**
 * Initials shown in the user avatar: first letter of the first and last words
 * ("Élodie de la Tour" gives "ÉT"), a single letter for a single word, "?" when empty.
 */
export function toInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = firstLetter(words[0]);
  const last = words.length > 1 ? firstLetter(words[words.length - 1]) : '';
  return (first + last).toLocaleUpperCase('fr');
}

/** First character, safe for characters outside the Basic Multilingual Plane. */
function firstLetter(word: string): string {
  return Array.from(word)[0];
}
