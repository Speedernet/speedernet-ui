import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { LucideCircleAlert, LucideDynamicIcon } from '@lucide/angular';
import { SnButton } from '../button/button';

/** Error screen with a retry button. */
@Component({
  selector: 'sn-error-state',
  imports: [LucideDynamicIcon, SnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="sn-state-icon"
      ><svg [lucideIcon]="icon" [size]="26" aria-hidden="true"></svg
    ></span>
    <strong>{{ title() }}</strong>
    <p>{{ text() }}</p>
    <button snButton variant="secondary" type="button" (click)="retry.emit()">
      {{ retryLabel() }}
    </button>
  `,
  styleUrl: './screen-state.scss',
  host: { class: 'sn-error-state', role: 'alert' },
})
export class SnErrorState {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly retryLabel = input('Réessayer');
  readonly retry = output<void>();
  protected readonly icon = LucideCircleAlert.icon;
}
