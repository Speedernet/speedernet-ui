import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideCircleAlert } from '@lucide/angular';
import { SnButton } from '../button/button';
import { SnEmptyState } from './empty-state';
import { SnErrorState } from './error-state';
import { SnLoading } from './loading';

@Component({
  imports: [SnLoading, SnEmptyState, SnErrorState, SnButton],
  template: `
    <sn-loading label="Loading bookings…" />
    <sn-empty-state title="No bookings" text="You haven't booked anything yet.">
      <button snButton variant="primary" type="button">Book</button>
    </sn-empty-state>
    <sn-empty-state id="custom" title="T" text="X" [icon]="customIcon" />
    <sn-error-state id="label" title="T" text="X" retryLabel="Start over" />
    <sn-error-state
      id="main"
      title="Could not load"
      text="An error occurred."
      (retry)="count = count + 1"
    />
  `,
})
class Host {
  count = 0;
  customIcon = LucideCircleAlert.icon;
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('SnLoading', () => {
  it('is a status with its label and a decorative animation', () => {
    const loading = setup().el.querySelector('sn-loading')!;
    expect(loading.getAttribute('role')).toBe('status');
    expect(loading.textContent).toContain('Loading bookings…');
    expect(loading.querySelector('.sn-loading-spinner')!.getAttribute('aria-hidden')).toBe('true');
    const lines = loading.querySelector('.sn-loading-lines')!;
    expect(lines.getAttribute('aria-hidden')).toBe('true');
    const items = Array.from(lines.children);
    expect(items.length).toBe(3);
    items.forEach((line, i) => expect(line.classList).toContain(`sn-loading-line-${i + 1}`));
  });
});

describe('SnEmptyState', () => {
  it('shows the title, text, icon and projected action', () => {
    const empty = setup().el.querySelector('sn-empty-state')!;
    expect(empty.querySelector('strong')!.textContent).toBe('No bookings');
    expect(empty.textContent).toContain("You haven't booked anything");
    expect(empty.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(empty.querySelector('button')!.textContent).toContain('Book');
  });

  it('renders the default icon, or the custom one when given', () => {
    const { el } = setup();
    const byDefault = el.querySelector('sn-empty-state svg')!.innerHTML;
    const custom = el.querySelector('#custom svg')!.innerHTML;
    expect(byDefault).not.toBe('');
    expect(custom).not.toBe('');
    expect(custom).not.toBe(byDefault);
  });
});

describe('SnErrorState', () => {
  it('is an alert with title and text', () => {
    const error = setup().el.querySelector('#main')!;
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.querySelector('strong')!.textContent).toBe('Could not load');
    expect(error.textContent).toContain('An error occurred.');
  });

  it('uses a custom retry label', () => {
    const button = setup().el.querySelector('#label button')!;
    expect(button.textContent!.trim()).toBe('Start over');
  });

  it('emits retry once per click on the retry button', () => {
    const { fixture, el } = setup();
    const button = el.querySelector('#main button') as HTMLButtonElement;
    expect(button.textContent!.trim()).toBe('Réessayer');
    button.click();
    expect(fixture.componentInstance.count).toBe(1);
  });
});
