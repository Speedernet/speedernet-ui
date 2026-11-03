import { TestBed } from '@angular/core/testing';
import { ScreenPage } from './screen-page';

describe('ScreenPage', () => {
  const proto = HTMLDialogElement.prototype;
  const original = { showModal: proto.showModal, close: proto.close };

  beforeEach(() => {
    // jsdom may not implement the modal API: minimal stand-ins.
    proto.showModal = function (this: HTMLDialogElement) {
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
    document.querySelectorAll('sn-toaster').forEach((t) => t.remove());
  });

  async function setup() {
    const fixture = TestBed.createComponent(ScreenPage);
    const root: HTMLElement = fixture.nativeElement;
    document.body.appendChild(root);
    await fixture.whenStable();
    const button = (text: string) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent!.trim() === text,
      )!;
    const dialog = root.querySelector('sn-dialog dialog') as HTMLDialogElement;
    const rows = () => [...root.querySelectorAll('.sn-table tbody tr')].map((r) => r.textContent!);
    const announced = () => document.querySelector('.sn-toast-announcer')!.textContent!.trim();
    const set = (name: string, value: string) => {
      const control = dialog.querySelector<HTMLInputElement>(`[formcontrolname="${name}"]`)!;
      control.value = value;
      control.dispatchEvent(new Event(control.tagName === 'SELECT' ? 'change' : 'input'));
    };
    const submit = async () => {
      dialog.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, root, button, dialog, rows, announced, set, submit };
  }

  it('opens the booking dialog from "Réserver une salle"', async () => {
    const { fixture, button, dialog } = await setup();
    button('Réserver une salle').click();
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')!.textContent).toContain('Réserver une salle');
    expect(dialog.querySelectorAll('sn-select select')).toHaveLength(2);
  });

  it('shows an error per empty field and keeps the dialog open', async () => {
    const { fixture, button, dialog, submit } = await setup();
    button('Réserver une salle').click();
    await fixture.whenStable();
    await submit();
    const errors = [...dialog.querySelectorAll('.sn-field-error')].map((e) =>
      e.textContent!.trim(),
    );
    expect(errors).toEqual([
      'Choisissez une salle.',
      'Choisissez une date.',
      'Choisissez un créneau.',
    ]);
    expect(dialog.querySelectorAll('[aria-invalid="true"]')).toHaveLength(3);
    expect(dialog.open).toBe(true);
  });

  it('adds the booking, closes the dialog and confirms with a toast', async () => {
    const { fixture, button, dialog, rows, announced, set, submit } = await setup();
    button('Réserver une salle').click();
    await fixture.whenStable();
    set('room', 'Confluence');
    set('date', '2026-03-13');
    set('slot', '10:00 - 11:00');
    await submit();
    expect(dialog.open).toBe(false);
    expect(rows()[0]).toContain('Confluence');
    expect(rows()[0]).toContain('13/03/2026');
    expect(announced()).toContain('Réservation enregistrée : Confluence, le 13/03/2026.');
  });

  it('gives each booking an action menu named after it', async () => {
    const { root } = await setup();
    const labels = [...root.querySelectorAll('.sn-table .sn-action-menu-trigger')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual([
      'Actions pour Croix-Rousse le 12/03/2026',
      'Actions pour Fourvière le 14/03/2026',
    ]);
  });

  it('cancels a booking from its menu and offers to restore it', async () => {
    const { fixture, root, rows, announced } = await setup();
    const menu = root.querySelector('.sn-table sn-action-menu')!;
    menu.querySelector<HTMLButtonElement>('.sn-action-menu-trigger')!.click();
    await fixture.whenStable();
    [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].at(-1)!.click();
    await fixture.whenStable();
    expect(rows()[0]).toContain('Annulée');
    expect(announced()).toContain('Réservation du 12/03/2026 annulée.');
    document.querySelector<HTMLButtonElement>('.sn-toast-action')!.click();
    await fixture.whenStable();
    expect(rows()[0]).toContain('Confirmée');
  });
});
