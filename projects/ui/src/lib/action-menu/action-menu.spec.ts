import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnActionMenu, SnMenuItem } from './action-menu';

@Component({
  imports: [SnActionMenu, SnMenuItem],
  template: `
    <sn-action-menu label="Actions pour la réservation du 12/03">
      <button snMenuItem (click)="chosen.set('modifier')">Modifier</button>
      <button snMenuItem (click)="chosen.set('dupliquer')">Dupliquer</button>
      <button snMenuItem disabled>Déplacer</button>
      <button snMenuItem tone="danger" (click)="chosen.set('annuler')">Annuler</button>
    </sn-action-menu>
    <button id="after" type="button">Après</button>
  `,
})
class Host {
  readonly chosen = signal<string | null>(null);
}

function key(target: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('SnActionMenu', () => {
  let fixture: ComponentFixture<Host>;
  let root: HTMLElement;
  let trigger: HTMLButtonElement;
  let menu: HTMLElement;
  const items = () => [...root.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
  const render = () => {
    fixture.detectChanges();
    TestBed.tick();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    root = fixture.nativeElement;
    document.body.appendChild(root);
    trigger = root.querySelector('.sn-action-menu-trigger')!;
    menu = root.querySelector('[role="menu"]')!;
  });

  afterEach(() => root.remove());

  it('names the button and links it to the closed menu', () => {
    expect(trigger.getAttribute('aria-label')).toBe('Actions pour la réservation du 12/03');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(menu.hidden).toBe(true);
    expect(trigger.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('gives items the menuitem role, out of the tab order', () => {
    for (const item of items()) {
      expect(item.getAttribute('tabindex')).toBe('-1');
      expect(item.getAttribute('type')).toBe('button');
    }
    expect(items()[3].classList).toContain('sn-menu-item-danger');
  });

  it('opens on click and focuses the first item', () => {
    trigger.click();
    render();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hidden).toBe(false);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('opens on ArrowUp on the last item', () => {
    trigger.focus();
    expect(key(trigger, 'ArrowUp').defaultPrevented).toBe(true);
    render();
    expect(document.activeElement).toBe(items()[3]);
  });

  it('moves with arrows, wraps around and skips disabled items', () => {
    trigger.click();
    render();
    key(items()[0], 'ArrowDown');
    expect(document.activeElement).toBe(items()[1]);
    key(items()[1], 'ArrowDown');
    expect(document.activeElement).toBe(items()[3]);
    key(items()[3], 'ArrowDown');
    expect(document.activeElement).toBe(items()[0]);
    key(items()[0], 'ArrowUp');
    expect(document.activeElement).toBe(items()[3]);
  });

  it('goes to the ends with Home and End, and to an item by its first letter', () => {
    trigger.click();
    render();
    key(items()[0], 'End');
    expect(document.activeElement).toBe(items()[3]);
    key(items()[3], 'Home');
    expect(document.activeElement).toBe(items()[0]);
    key(items()[0], 'd');
    expect(document.activeElement).toBe(items()[1]);
  });

  it('closes on Escape and gives focus back to the button', () => {
    trigger.click();
    render();
    expect(key(items()[0], 'Escape').defaultPrevented).toBe(true);
    render();
    expect(menu.hidden).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('runs the chosen action, closes and gives focus back to the button', () => {
    trigger.click();
    render();
    items()[3].click();
    render();
    expect(fixture.componentInstance.chosen()).toBe('annuler');
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Tab without taking focus back', () => {
    trigger.click();
    render();
    key(items()[0], 'Tab');
    render();
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('closes on a click outside', () => {
    trigger.click();
    render();
    root.querySelector<HTMLButtonElement>('#after')!.click();
    render();
    expect(menu.hidden).toBe(true);
  });

  it('closes when the button is clicked again', () => {
    trigger.click();
    render();
    trigger.click();
    render();
    expect(menu.hidden).toBe(true);
  });

  it('gives each menu its own ids', () => {
    const other = TestBed.createComponent(Host);
    other.detectChanges();
    expect(other.nativeElement.querySelector('[role="menu"]').id).not.toBe(menu.id);
  });
});
