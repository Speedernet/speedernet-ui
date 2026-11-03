import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { LucideCircleAlert, LucideDynamicIcon } from '@lucide/angular';
import { SpeedButton } from '../button/button';

/** Error screen with a retry button. */
@Component({
  selector: 'speed-error-state',
  imports: [LucideDynamicIcon, SpeedButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="speed-state-icon"
      ><svg [lucideIcon]="icon" [size]="26" aria-hidden="true"></svg
    ></span>
    <strong>{{ title() }}</strong>
    <p>{{ text() }}</p>
    <button speedButton variant="secondary" type="button" (click)="retry.emit()">
      {{ retryLabel() }}
    </button>
  `,
  styleUrl: './screen-state.scss',
  host: { class: 'speed-error-state', role: 'alert' },
})
export class SpeedErrorState {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly retryLabel = input('Réessayer');
  readonly retry = output<void>();
  protected readonly icon = LucideCircleAlert.icon;
}
