import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnConfirmDialog } from './confirm-dialog';

@Component({
  imports: [SnConfirmDialog],
  template: `
    <button id="opener" type="button">Open</button>
    <sn-confirm-dialog
      title="Delete the booking on 12/03?"
      confirmLabel="Delete"
      (confirmed)="confirmed = confirmed + 1"
      (cancelled)="cancelled = cancelled + 1"
    >
      This cannot be undone.
    </sn-confirm-dialog>
  `,
})
class Host {
  confirmed = 0;
  cancelled = 0;
  readonly dialog = viewChild.required(SnConfirmDialog);
}

describe('SnConfirmDialog', () => {
  const proto = HTMLDialogElement.prototype;
  const original = { showModal: proto.showModal, close: proto.close };

  beforeEach(() => {
    // jsdom may not implement the modal API: minimal stand-ins.
    proto.showModal = function (this: HTMLDialogElement) {
      if (this.hasAttribute('open')) return;
      this.setAttribute('open', '');
    };
    proto.close = function (this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  afterEach(() => {
    proto.showModal = original.showModal;
    proto.close = original.close;
  });

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const opener = root.querySelector('#opener') as HTMLButtonElement;
    document.body.appendChild(root);
    opener.focus();
    const dialog = root.querySelector('dialog') as HTMLDialogElement;
    const buttons = () => Array.from(dialog.querySelectorAll('button')) as HTMLButtonElement[];
    const open = () => {
      fixture.componentInstance.dialog().open();
      fixture.detectChanges();
    };
    return { fixture, root, opener, dialog, buttons, open };
  }

  it('is closed until open() is called', () => {
    const { dialog } = setup();
    expect(dialog.open).toBe(false);
  });

  it('opens modally, labelled by its title, with focus on cancel', () => {
    const { dialog, open, buttons } = setup();
    open();
    expect(dialog.open).toBe(true);
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!)!;
    expect(title.tagName).toBe('H2');
    expect(title.textContent).toContain('Delete the booking on 12/03?');
    expect(buttons()[0].textContent).toContain('Annuler');
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('projects the message and shows a danger confirm button after cancel', () => {
    const { dialog, open, buttons } = setup();
    open();
    expect(dialog.textContent).toContain('This cannot be undone.');
    expect(buttons()[0].classList).toContain('sn-button-secondary');
    expect(buttons()[1].textContent).toContain('Delete');
    expect(buttons()[1].classList).toContain('sn-button-danger');
  });

  it('uses unique title ids per instance', () => {
    const a = setup();
    const b = setup();
    expect(a.dialog.getAttribute('aria-labelledby')).not.toBe(
      b.dialog.getAttribute('aria-labelledby'),
    );
  });

  it('confirms: emits confirmed, closes and restores focus', () => {
    const { fixture, dialog, open, buttons, opener } = setup();
    open();
    buttons()[1].click();
    expect(fixture.componentInstance.confirmed).toBe(1);
    expect(fixture.componentInstance.cancelled).toBe(0);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('cancels with the button: emits cancelled, closes and restores focus', () => {
    const { fixture, dialog, open, buttons, opener } = setup();
    open();
    buttons()[0].click();
    expect(fixture.componentInstance.cancelled).toBe(1);
    expect(fixture.componentInstance.confirmed).toBe(0);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('cancels with Escape: emits cancelled once, closes and restores focus', () => {
    const { fixture, dialog, open, opener } = setup();
    open();
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.cancelled).toBe(1);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('ignores open() while already open and still restores focus to the opener', () => {
    const { fixture, dialog, open, buttons, opener } = setup();
    open();
    open();
    buttons()[0].click();
    expect(fixture.componentInstance.cancelled).toBe(1);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('does not throw when the opener was removed before closing', () => {
    const { fixture, open, buttons, opener } = setup();
    open();
    opener.remove();
    expect(() => buttons()[0].click()).not.toThrow();
    expect(fixture.componentInstance.cancelled).toBe(1);
  });

  it('emits cancelled once on a native close, and only confirmed on confirm', () => {
    const { fixture, dialog, open, buttons, opener } = setup();
    open();
    dialog.close();
    expect(fixture.componentInstance.cancelled).toBe(1);
    expect(document.activeElement).toBe(opener);
    open();
    buttons()[1].click();
    expect(fixture.componentInstance.confirmed).toBe(1);
    expect(fixture.componentInstance.cancelled).toBe(1);
  });

  it('honors a custom cancel label', () => {
    const fixture = TestBed.createComponent(SnConfirmDialog);
    fixture.componentRef.setInput('title', 'T');
    fixture.componentRef.setInput('confirmLabel', 'OK');
    fixture.componentRef.setInput('cancelLabel', 'Back');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Back');
  });
});
