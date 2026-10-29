import { toInitials } from './to-initials';

describe('toInitials', () => {
  it.each([
    ['Camille Dupont', 'CD'],
    ['camille', 'C'],
    ['Élodie de la Tour', 'ÉT'],
    ['  ', '?'],
    ['', '?'],
    ['Jean-Pierre Martin', 'JM'],
    ['  anne   marie  ', 'AM'],
  ])('%j gives %j', (displayName, expected) => {
    expect(toInitials(displayName)).toBe(expected);
  });
});
