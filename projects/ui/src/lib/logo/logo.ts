import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SpeedLogoFull, SpeedLogoMark } from './logo-svgs';

/** Official Speedernet logo: the compact mark or the full logo, as an inline SVG. */
@Component({
  selector: 'speed-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpeedLogoFull, SpeedLogoMark],
  template: `
    @if (variant() === 'full') {
      <speed-logo-full />
    } @else {
      <speed-logo-mark />
    }
  `,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
    :host > * {
      height: 100%;
    }
  `,
  host: {
    '[attr.role]': 'alt() ? "img" : null',
    '[attr.aria-label]': 'alt() || null',
    '[attr.aria-hidden]': 'alt() ? null : "true"',
  },
})
export class SpeedLogo {
  readonly variant = input<'mark' | 'full'>('mark');
  /** Accessible label; empty (the default) for a decorative logo, e.g. next to the application name. */
  readonly alt = input('');
}
