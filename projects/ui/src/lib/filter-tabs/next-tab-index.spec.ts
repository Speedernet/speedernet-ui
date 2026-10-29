import { nextTabIndex } from './next-tab-index';

describe('nextTabIndex', () => {
  it('moves right and wraps to the start', () => {
    expect(nextTabIndex(0, 'ArrowRight', 3)).toBe(1);
    expect(nextTabIndex(2, 'ArrowRight', 3)).toBe(0);
  });

  it('moves left and wraps to the end', () => {
    expect(nextTabIndex(0, 'ArrowLeft', 3)).toBe(2);
  });

  it('jumps to the first and last tab', () => {
    expect(nextTabIndex(1, 'Home', 3)).toBe(0);
    expect(nextTabIndex(0, 'End', 3)).toBe(2);
  });

  it('ignores other keys', () => {
    expect(nextTabIndex(1, 'a', 3)).toBe(1);
  });
});
