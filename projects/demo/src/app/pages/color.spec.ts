import { swatchInfo } from './color';

describe('swatchInfo', () => {
  it('gives the brand hex values back from their OKLCH tokens', () => {
    expect(swatchInfo('oklch(91.5% 0.166 99)')?.hex).toBe('#FFE44B');
    expect(swatchInfo('oklch(31.3% 0 0)')?.hex).toBe('#313131');
    expect(swatchInfo('oklch(22.7% 0.012 270.8)')?.hex).toBe('#1A1C22');
  });

  it('picks the text color with the best contrast and its WCAG level', () => {
    expect(swatchInfo('oklch(97.5% 0 0)')).toMatchObject({ text: 'dark', level: 'AA' });
    expect(swatchInfo('oklch(31.3% 0 0)')).toMatchObject({ text: 'light', level: 'AA' });
    expect(swatchInfo('oklch(63.6% 0 0)')?.level).toBe('AA gros texte');
  });

  it('returns null for a value that is not OKLCH', () => {
    expect(swatchInfo('')).toBeNull();
    expect(swatchInfo('var(--gray-900)')).toBeNull();
  });
});
