import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SpeedDialog } from './dialog';

@Component({
  imports: [SpeedDialog],
  template: `
    <button id="opener" type="button">Open</button>
    <speed-dialog
      title="Book a room"
      (closed)="closed = closed + 1"
      (dismissed)="dismissed = dismissed + 1"
    >
      <label for="room">Room</label>
      <input id="room" />
      <input id="date" />
      <button speedDialogActions id="cancel" type="button">Cancel</button>
      <button speedDialogActions id="submit" type="button">Book</button>
    </speed-dialog>
  `,
})
class Host {
  closed = 0;
  dismissed = 0;
  readonly dialog = viewChild.required(SpeedDialog);
}

@Component({
  imports: [SpeedDialog],
  template: `
    <speed-dialog title="Information">
      <p>No focusable element in the content.</p>
      <button speedDialogActions type="button">Got it</button>
    </speed-dialog>
  `,
})
class TextOnlyHost {
  readonly dialog = viewChild.required(SpeedDialog);
}

describe('SpeedDialog', () => {
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
    document.body.appendChild(root);
    const opener = root.querySelector<HTMLButtonElement>('#opener')!;
    opener.focus();
    const dialog = root.querySelector('dialog')!;
    const host = fixture.componentInstance;
    const open = () => {
      host.dialog().open();
      fixture.detectChanges();
    };
    return { fixture, root, host, opener, dialog, open };
  }

  it('is closed until open() is called', () => {
    const { dialog, host } = setup();
    expect(dialog.open).toBe(false);
    expect(host.dialog().isOpen).toBe(false);
  });

  it('opens modally, labelled by its h2 title', () => {
    const { dialog, open, host } = setup();
    open();
    expect(dialog.open).toBe(true);
    expect(host.dialog().isOpen).toBe(true);
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!)!;
    expect(title.tagName).toBe('H2');
    expect(title.textContent).toContain('Book a room');
  });

  it('projects the content in the body and the actions in the actions area', () => {
    const { dialog } = setup();
    expect(dialog.querySelector('.speed-dialog-body #room')).not.toBeNull();
    const actions = dialog.querySelectorAll('.speed-dialog-actions button');
    expect([...actions].map((b) => b.id)).toEqual(['cancel', 'submit']);
  });

  it('moves focus to the first focusable element on open', () => {
    const { root, open } = setup();
    open();
    expect(document.activeElement).toBe(root.querySelector('#room'));
  });

  it('prefers the element marked autofocus', () => {
    const { root, open } = setup();
    root.querySelector('#date')!.setAttribute('autofocus', '');
    open();
    expect(document.activeElement).toBe(root.querySelector('#date'));
  });

  it('focuses the dialog itself, not the actions, when the content holds nothing focusable', () => {
    const fixture = TestBed.createComponent(TextOnlyHost);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.dialog().open();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('dialog'));
  });

  it('close(): closes, restores focus and emits closed only', () => {
    const { host, dialog, open, opener } = setup();
    open();
    host.dialog().close();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(host.closed).toBe(1);
    expect(host.dismissed).toBe(0);
  });

  it('ignores close() when already closed', () => {
    const { host } = setup();
    host.dialog().close();
    expect(host.closed).toBe(0);
  });

  it('Escape: closes, restores focus and emits dismissed once', () => {
    const { host, dialog, open, opener } = setup();
    open();
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(host.dismissed).toBe(1);
    expect(host.closed).toBe(1);
  });

  it('a native close counts as a dismissal and restores focus', () => {
    const { host, dialog, open, opener } = setup();
    open();
    dialog.close();
    expect(host.dismissed).toBe(1);
    expect(host.closed).toBe(1);
    expect(document.activeElement).toBe(opener);
  });

  it('ignores open() while already open and still restores focus to the opener', () => {
    const { host, open, opener } = setup();
    open();
    open();
    host.dialog().close();
    expect(document.activeElement).toBe(opener);
  });

  it('does not throw when the opener was removed before closing', () => {
    const { host, open, opener } = setup();
    open();
    opener.remove();
    expect(() => host.dialog().close()).not.toThrow();
  });

  it('uses unique title ids per instance', () => {
    const a = setup();
    const b = setup();
    expect(a.dialog.getAttribute('aria-labelledby')).not.toBe(
      b.dialog.getAttribute('aria-labelledby'),
    );
  });
});
