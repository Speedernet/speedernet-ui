import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { statusAppearance, type SnStatus } from './status-appearance';

/** Badge whose tone and icon follow a status; shares the SnBadge stylesheet. */
@Component({
  selector: 'sn-status-badge',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<svg [lucideIcon]="appearance().icon" [size]="13" aria-hidden="true"></svg
    >{{ label() }}`,
  styleUrl: './badge.scss',
  host: {
    class: 'sn-badge',
    '[class]': "'sn-badge-' + appearance().tone",
  },
})
export class SnStatusBadge {
  readonly status = input.required<SnStatus>();
  readonly label = input.required<string>();
  protected readonly appearance = computed(() => statusAppearance(this.status()));
}
