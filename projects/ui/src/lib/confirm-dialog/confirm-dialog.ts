import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';
import { SnButton } from '../button/button';

let nextId = 0;

/**
 * Modal confirmation dialog built on the native `<dialog>`. The message is projected.
 * Focus starts on the cancel button (the safe action) and returns to the previously focused
 * element on any close, including Escape.
 */
@Component({
  selector: 'sn-confirm-dialog',
  imports: [SnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <dialog
      #dialog
      class="sn-confirm-dialog"
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
    >
      <h2 class="sn-confirm-dialog-title" [id]="titleId">{{ title() }}</h2>
      <div class="sn-confirm-dialog-message"><ng-content /></div>
      <div class="sn-confirm-dialog-actions">
        <button #cancelButton snButton variant="secondary" type="button" (click)="cancel()">
          {{ cancelLabel() }}
        </button>
        <button snButton variant="danger" type="button" (click)="confirm()">
          {{ confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
  styleUrl: './confirm-dialog.scss',
})
export class SnConfirmDialog {
  readonly title = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly cancelLabel = input('Annuler');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly titleId = `sn-confirm-dialog-title-${nextId++}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly cancelButton = viewChild.required('cancelButton', {
    read: ElementRef<HTMLButtonElement>,
  });
  private previouslyFocused: HTMLElement | null = null;

  /** Opens the dialog and moves focus to the cancel button. */
  open(): void {
    const active = document.activeElement;
    this.previouslyFocused = active instanceof HTMLElement ? active : null;
    this.dialog().nativeElement.showModal();
    this.cancelButton().nativeElement.focus();
  }

  protected confirm(): void {
    this.close();
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.close();
    this.cancelled.emit();
  }

  /** Escape: handle it ourselves instead of letting the browser close silently. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.cancel();
  }

  private close(): void {
    this.dialog().nativeElement.close();
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }
}
