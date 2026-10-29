import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

export type SnBadgeTone = 'neutral' | 'primary' | 'accent' | 'brand' | 'solid' | 'outline';

/** Small pill with a short word; the optional icon is decorative. */
@Component({
  selector: 'sn-badge',
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
    class: 'sn-badge',
    '[class]': "'sn-badge-' + tone()",
  },
})
export class SnBadge {
  readonly tone = input<SnBadgeTone>('neutral');
  readonly icon = input<LucideIconData | null>(null);
}
