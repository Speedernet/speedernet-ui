import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnToastService } from './toast';

describe('SnToastService', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  function setup() {
    const opener = document.createElement('button');
    opener.textContent = 'Supprimer';
    document.body.appendChild(opener);
    opener.focus();
    const service = TestBed.inject(SnToastService);
    const toaster = document.body.querySelector<HTMLElement>('sn-toaster')!;
    const appRef = TestBed.inject(ApplicationRef);
    const render = () => appRef.tick();
    const toasts = () => [...toaster.querySelectorAll<HTMLElement>('.sn-toast')];
    const stack = toaster.querySelector<HTMLElement>('.sn-toast-stack')!;
    return { service, toaster, toasts, stack, opener, render };
  }

  it('adds an empty polite live region to the page as soon as it is injected', () => {
    const { toaster } = setup();
    const region = toaster.querySelector('[role="status"]')!;
    expect(region).not.toBeNull();
    expect(region.textContent!.trim()).toBe('');
  });

  it('shows the message, announces it and leaves focus where it was', () => {
    const { service, toaster, toasts, opener } = setup();
    service.show('Réservation supprimée');
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0].querySelector('.sn-toast-message')!.textContent).toBe(
      'Réservation supprimée',
    );
    expect(toaster.querySelector('[role="status"]')!.textContent!.trim()).toBe(
      "C'est fait : Réservation supprimée",
    );
    expect(document.activeElement).toBe(opener);
  });

  it('shows its type with a badge word, success by default', () => {
    const { service, toasts } = setup();
    service.show('Réservation supprimée');
    service.show("La réservation n'a pas pu être supprimée.", { type: 'error' });
    const badges = toasts().map((t) => t.querySelector('sn-badge')!);
    expect(badges[0].textContent!.trim()).toBe("C'est fait");
    expect(badges[0].classList).toContain('sn-badge-solid');
    expect(badges[1].textContent!.trim()).toBe('Erreur');
    expect(badges[1].classList).toContain('sn-badge-brand');
  });

  it('labels the close button and hides its icon', () => {
    const { service, toasts } = setup();
    service.show('Réservation supprimée');
    const close = toasts()[0].querySelector('.sn-toast-close')!;
    expect(close.getAttribute('aria-label')).toBe('Fermer la notification');
    expect(close.getAttribute('type')).toBe('button');
    expect(close.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('disappears after 5 s and resolves "dismissed"', async () => {
    const { service, toasts, render } = setup();
    const ref = service.show('Réservation supprimée');
    vi.advanceTimersByTime(4999);
    render();
    expect(toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    render();
    expect(toasts()).toHaveLength(0);
    await expect(ref.result).resolves.toBe('dismissed');
  });

  it('keeps a toast with an action for 10 s and resolves "action" when it is used', async () => {
    const { service, toasts, render } = setup();
    const ref = service.show('Réservation supprimée', { action: 'Annuler' });
    vi.advanceTimersByTime(9000);
    render();
    const action = toasts()[0].querySelector<HTMLButtonElement>('.sn-toast-action')!;
    expect(action.textContent!.trim()).toBe('Annuler');
    action.click();
    render();
    expect(toasts()).toHaveLength(0);
    await expect(ref.result).resolves.toBe('action');
  });

  it('honors a custom duration', () => {
    const { service, toasts, render } = setup();
    service.show('Copié', { duration: 1000 });
    vi.advanceTimersByTime(1000);
    render();
    expect(toasts()).toHaveLength(0);
  });

  it('closes with its close button', async () => {
    const { service, toasts, render } = setup();
    const ref = service.show('Réservation supprimée');
    toasts()[0].querySelector<HTMLButtonElement>('.sn-toast-close')!.click();
    render();
    expect(toasts()).toHaveLength(0);
    await expect(ref.result).resolves.toBe('dismissed');
  });

  it('can be dismissed by code', () => {
    const { service, toasts, render } = setup();
    service.show('Réservation supprimée').dismiss();
    render();
    expect(toasts()).toHaveLength(0);
  });

  it('pauses while hovered and resumes with the remaining time', () => {
    const { service, toasts, stack, render } = setup();
    service.show('Réservation supprimée');
    vi.advanceTimersByTime(3000);
    stack.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(60000);
    render();
    expect(toasts()).toHaveLength(1);
    stack.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1999);
    render();
    expect(toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    render();
    expect(toasts()).toHaveLength(0);
  });

  it('pauses while focus is inside, then Escape closes it and focus goes back', () => {
    const { service, toasts, opener, render } = setup();
    service.show('Réservation supprimée', { action: 'Annuler' });
    const action = toasts()[0].querySelector<HTMLButtonElement>('.sn-toast-action')!;
    action.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: opener }));
    action.focus();
    vi.advanceTimersByTime(60000);
    render();
    expect(toasts()).toHaveLength(1);
    action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    render();
    expect(toasts()).toHaveLength(0);
    expect(document.activeElement).toBe(opener);
  });

  it('keeps at most three toasts, removing the oldest', () => {
    const { service, toasts } = setup();
    for (const n of [1, 2, 3, 4]) service.show(`Message ${n}`);
    const messages = toasts().map((t) => t.querySelector('.sn-toast-message')!.textContent);
    expect(messages).toEqual(['Message 2', 'Message 3', 'Message 4']);
  });
});
