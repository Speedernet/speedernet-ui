import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';
import { SpeedButton } from '../button/button';
import { SpeedDialog } from '../dialog/dialog';

/**
 * Modal confirmation dialog built on `speed-dialog`. The message is projected.
 * Focus starts on the cancel button (the safe action) and returns to the previously focused
 * element on any close, including Escape.
 */
@Component({
  selector: 'speed-confirm-dialog',
  imports: [SpeedButton, SpeedDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <speed-dialog [title]="title()" (dismissed)="cancelled.emit()">
      <p class="speed-confirm-dialog-message"><ng-content /></p>
      <button
        speedDialogActions
        speedButton
        variant="secondary"
        type="button"
        autofocus
        (click)="cancel()"
      >
        {{ cancelLabel() }}
      </button>
      <button speedDialogActions speedButton variant="danger" type="button" (click)="confirm()">
        {{ confirmLabel() }}
      </button>
    </speed-dialog>
  `,
  styles: '.speed-confirm-dialog-message { margin: 0; }',
})
export class SpeedConfirmDialog {
  readonly title = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly cancelLabel = input('Annuler');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required(SpeedDialog);

  /** Opens the dialog and moves focus to the cancel button. */
  open(): void {
    this.dialog().open();
  }

  protected confirm(): void {
    this.dialog().close();
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.dialog().close();
    this.cancelled.emit();
  }
}
