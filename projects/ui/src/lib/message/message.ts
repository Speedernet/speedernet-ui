import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { SpeedBadge } from '../badge/badge';
import { messageAppearance, type SpeedMessageType } from './message-appearance';

/** Inline feedback message: a badge word followed by the projected text. */
@Component({
  selector: 'speed-message',
  imports: [SpeedBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <speed-badge [tone]="appearance().tone" [icon]="appearance().icon">{{
      appearance().label
    }}</speed-badge>
    <span><ng-content /></span>
  `,
  styleUrl: './message.scss',
  host: {
    class: 'speed-message',
    role: 'status',
  },
})
export class SpeedMessage {
  readonly type = input.required<SpeedMessageType>();
  protected readonly appearance = computed(() => messageAppearance(this.type()));
}
