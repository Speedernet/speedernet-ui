import { LucideArchive, LucideCheck, LucideClock, LucideX } from '@lucide/angular';
import { statusAppearance } from './status-appearance';

describe('statusAppearance', () => {
  it('maps confirmed to the primary tone with a check', () => {
    expect(statusAppearance('confirmed')).toEqual({ tone: 'primary', icon: LucideCheck.icon });
  });

  it('maps pending to the accent tone with a clock', () => {
    expect(statusAppearance('pending')).toEqual({ tone: 'accent', icon: LucideClock.icon });
  });

  it('maps cancelled to the brand tone with a cross', () => {
    expect(statusAppearance('cancelled')).toEqual({ tone: 'brand', icon: LucideX.icon });
  });

  it('maps archived to the neutral tone with an archive box', () => {
    expect(statusAppearance('archived')).toEqual({ tone: 'neutral', icon: LucideArchive.icon });
  });
});
