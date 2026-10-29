import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnFilterTabs, type SnFilterOption } from './filter-tabs';

@Component({
  imports: [SnFilterTabs],
  template: `<sn-filter-tabs [options]="options" label="Période" [(value)]="value" />`,
})
class Host {
  readonly options: SnFilterOption[] = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'past', label: 'Passées' },
  ];
  readonly value = signal('week');
}

function render() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const tabs = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  return { fixture, root, tabs };
}

describe('SnFilterTabs', () => {
  it('renders a labelled tablist', () => {
    const { root } = render();
    const list = root.querySelector('[role="tablist"]')!;
    expect(list.getAttribute('aria-label')).toBe('Période');
  });

  it('marks only the active option as selected and tabbable', () => {
    const { tabs } = render();
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('selects the clicked option', () => {
    const { fixture, tabs } = render();
    tabs()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('month');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
  });

  it('moves focus and selection with ArrowRight', () => {
    const { fixture, tabs } = render();
    tabs()[0].focus();
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('month');
    expect(document.activeElement).toBe(tabs()[1]);
  });

  function press(tab: HTMLElement, key: string, init: KeyboardEventInit = {}) {
    tab.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
  }

  it('wraps to the last tab with ArrowLeft', () => {
    const { fixture, tabs } = render();
    press(tabs()[0], 'ArrowLeft');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('past');
    expect(document.activeElement).toBe(tabs()[2]);
  });

  it('jumps to the last and first tabs with End and Home', () => {
    const { fixture, tabs } = render();
    press(tabs()[0], 'End');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('past');
    press(tabs()[2], 'Home');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('week');
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('ignores arrows combined with Alt, Ctrl or Meta', () => {
    const { fixture, tabs } = render();
    press(tabs()[0], 'ArrowRight', { altKey: true });
    press(tabs()[0], 'ArrowRight', { ctrlKey: true });
    press(tabs()[0], 'ArrowRight', { metaKey: true });
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('week');
  });

  it('keeps the first tab reachable when the value matches no option', () => {
    const { fixture, tabs } = render();
    fixture.componentInstance.value.set('unknown');
    fixture.detectChanges();
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });
});
