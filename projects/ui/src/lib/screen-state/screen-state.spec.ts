import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnButton } from '../button/button';
import { SnEmptyState } from './empty-state';
import { SnErrorState } from './error-state';
import { SnLoading } from './loading';

@Component({
  imports: [SnLoading, SnEmptyState, SnErrorState, SnButton],
  template: `
    <sn-loading label="Chargement des réservations…" />
    <sn-empty-state title="Aucune réservation" text="Vous n'avez rien réservé pour le moment.">
      <button snButton variant="primary" type="button">Réserver</button>
    </sn-empty-state>
    <sn-error-state
      title="Chargement impossible"
      text="Une erreur est survenue."
      (retry)="count = count + 1"
    />
  `,
})
class Host {
  count = 0;
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
    expect(loading.textContent).toContain('Chargement des réservations…');
    expect(loading.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });
});

describe('SnEmptyState', () => {
  it('shows the title, text, icon and projected action', () => {
    const empty = setup().el.querySelector('sn-empty-state')!;
    expect(empty.querySelector('strong')!.textContent).toBe('Aucune réservation');
    expect(empty.textContent).toContain("Vous n'avez rien réservé");
    expect(empty.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(empty.querySelector('button')!.textContent).toContain('Réserver');
  });
});

describe('SnErrorState', () => {
  it('is an alert with title and text', () => {
    const error = setup().el.querySelector('sn-error-state')!;
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.querySelector('strong')!.textContent).toBe('Chargement impossible');
    expect(error.textContent).toContain('Une erreur est survenue.');
  });

  it('emits retry once per click on the retry button', () => {
    const { fixture, el } = setup();
    const button = el.querySelector('sn-error-state button') as HTMLButtonElement;
    expect(button.textContent!.trim()).toBe('Réessayer');
    button.click();
    expect(fixture.componentInstance.count).toBe(1);
  });
});
