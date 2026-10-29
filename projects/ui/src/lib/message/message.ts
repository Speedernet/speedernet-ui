import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { SnBadge } from '../badge/badge';
import { messageAppearance, type SnMessageType } from './message-appearance';

/** Inline feedback message: a badge word followed by the projected text. */
@Component({
  selector: 'sn-message',
  imports: [SnBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <sn-badge [tone]="appearance().tone" [icon]="appearance().icon">{{
      appearance().label
    }}</sn-badge>
    <span><ng-content /></span>
  `,
  styleUrl: './message.scss',
  host: {
    class: 'sn-message',
    role: 'status',
  },
})
export class SnMessage {
  readonly type = input.required<SnMessageType>();
  protected readonly appearance = computed(() => messageAppearance(this.type()));
}
