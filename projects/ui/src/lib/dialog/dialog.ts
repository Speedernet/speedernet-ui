import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';

let nextId = 0;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Generic modal dialog built on the native `<dialog>`: a title, free projected content and an
 * actions area (`speedDialogActions`). The page behind is inert while it is open, so focus stays
 * inside. On opening, focus goes to the element marked `autofocus`, else the first focusable
 * element of the content, else the dialog itself, so a long text is read from its start rather
 * than from the actions. Focus returns to the previously focused element on any close.
 * Escape closes it and emits `dismissed`.
 */
@Component({
  selector: 'speed-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <dialog
      #dialog
      class="speed-dialog"
      tabindex="-1"
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
      (close)="onNativeClose()"
    >
      <h2 class="speed-dialog-title" [id]="titleId">{{ title() }}</h2>
      <div class="speed-dialog-body"><ng-content /></div>
      <div class="speed-dialog-actions"><ng-content select="[speedDialogActions]" /></div>
    </dialog>
  `,
  styleUrl: './dialog.scss',
})
export class SpeedDialog {
  readonly title = input.required<string>();

  /** Emitted on every close, whatever its cause. */
  readonly closed = output<void>();
  /** Emitted when the user closes the dialog without an action: Escape or a native close. */
  readonly dismissed = output<void>();

  protected readonly titleId = `speed-dialog-title-${nextId++}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private previouslyFocused: HTMLElement | null = null;
  // True while a close we initiated is waiting for its `close` event.
  private closingByUs = false;

  /** True while the dialog is open. */
  get isOpen(): boolean {
    return this.dialog().nativeElement.open;
  }

  /** Opens the dialog and moves focus inside it. */
  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;
    const active = document.activeElement;
    this.previouslyFocused = active instanceof HTMLElement ? active : null;
    dialog.showModal();
    const target =
      dialog.querySelector<HTMLElement>('[autofocus]') ??
      dialog.querySelector<HTMLElement>(`.speed-dialog-body :is(${FOCUSABLE})`) ??
      dialog;
    target.focus();
  }

  /** Closes the dialog and returns focus to the element that had it before opening. */
  close(): void {
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) return;
    this.closingByUs = true;
    dialog.close();
    this.finish();
  }

  /** Escape: handle it ourselves instead of letting the browser close silently. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.close();
    this.dismissed.emit();
  }

  /** Safety net: the dialog was closed natively (form method="dialog", repeated Escape...). */
  protected onNativeClose(): void {
    if (this.closingByUs) {
      this.closingByUs = false;
      return;
    }
    this.finish();
    this.dismissed.emit();
  }

  private finish(): void {
    const element = this.previouslyFocused;
    this.previouslyFocused = null;
    if (element?.isConnected) element.focus();
    this.closed.emit();
  }
}
