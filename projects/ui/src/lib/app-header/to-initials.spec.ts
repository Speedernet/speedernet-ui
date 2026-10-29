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
    ['Camille Dupont (DSI)', 'CD'],
    ['« Camille » Dupont', 'CD'],
    ['Élodie Tour', 'ÉT'],
    ['Élodie Tour', 'ÉT'],
    ['- 42', '?'],
    ['Camille Martin (DSI)', 'CM'],
    ['Camille Martin [Externe]', 'CM'],
    ['(DSI)', '?'],
  ])('%j gives %j', (displayName, expected) => {
    expect(toInitials(displayName)).toBe(expected);
  });
});
