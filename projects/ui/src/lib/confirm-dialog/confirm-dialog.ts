import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';
import { SnButton } from '../button/button';
import { SnDialog } from '../dialog/dialog';

/**
 * Modal confirmation dialog built on `sn-dialog`. The message is projected.
 * Focus starts on the cancel button (the safe action) and returns to the previously focused
 * element on any close, including Escape.
 */
@Component({
  selector: 'sn-confirm-dialog',
  imports: [SnButton, SnDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <sn-dialog [title]="title()" (dismissed)="cancelled.emit()">
      <p class="sn-confirm-dialog-message"><ng-content /></p>
      <button
        snDialogActions
        snButton
        variant="secondary"
        type="button"
        autofocus
        (click)="cancel()"
      >
        {{ cancelLabel() }}
      </button>
      <button snDialogActions snButton variant="danger" type="button" (click)="confirm()">
        {{ confirmLabel() }}
      </button>
    </sn-dialog>
  `,
  styles: '.sn-confirm-dialog-message { margin: 0; }',
})
export class SnConfirmDialog {
  readonly title = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly cancelLabel = input('Annuler');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required(SnDialog);

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
