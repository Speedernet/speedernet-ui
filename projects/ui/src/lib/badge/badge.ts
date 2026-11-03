import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

export type SpeedBadgeTone = 'neutral' | 'primary' | 'accent' | 'brand' | 'solid' | 'outline';

/** Small pill with a short word; the optional icon is decorative. */
@Component({
  selector: 'speed-badge',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (icon(); as icon) {
      <svg [lucideIcon]="icon" [size]="13" aria-hidden="true"></svg>
    }
    <ng-content />
  `,
  styleUrl: './badge.scss',
  host: {
    class: 'speed-badge',
    '[class]': "'speed-badge-' + tone()",
  },
})
export class SpeedBadge {
  readonly tone = input<SpeedBadgeTone>('neutral');
  readonly icon = input<LucideIconData | null>(null);
}
