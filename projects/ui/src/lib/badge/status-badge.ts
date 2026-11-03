import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { statusAppearance, type SpeedStatus } from './status-appearance';

/** Badge whose tone and icon follow a status; shares the SpeedBadge stylesheet. */
@Component({
  selector: 'speed-status-badge',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<svg [lucideIcon]="appearance().icon" [size]="13" aria-hidden="true"></svg
    >{{ label() }}`,
  styleUrl: './badge.scss',
  host: {
    class: 'speed-badge',
    '[class]': "'speed-badge-' + appearance().tone",
  },
})
export class SpeedStatusBadge {
  readonly status = input.required<SpeedStatus>();
  readonly label = input.required<string>();
  protected readonly appearance = computed(() => statusAppearance(this.status()));
}
