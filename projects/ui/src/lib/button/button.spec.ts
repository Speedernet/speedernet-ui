import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideArrowRight } from '@lucide/angular';
import { SnButton } from './button';
import { SnIconButton } from './icon-button';

@Component({
  imports: [SnButton, SnIconButton],
  template: `
    <button id="primary" snButton variant="primary">Valider</button>
    <button id="default" snButton>Annuler</button>
    <button id="danger" snButton variant="danger">Supprimer</button>
    <a id="link" snButton href="/somewhere">Aller</a>
    <button id="icon" snIconButton label="Suivant" [icon]="arrowRight"></button>
    <button id="dark" snIconButton label="Suivant" [icon]="arrowRight" variant="dark"></button>
  `,
})
class Host {
  readonly arrowRight = LucideArrowRight.icon;
}

function render(): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('SnButton', () => {
  it('applies the primary variant classes', () => {
    const button = render().querySelector('#primary')!;
    expect(button.classList).toContain('sn-button');
    expect(button.classList).toContain('sn-button-primary');
  });

  it('is secondary by default', () => {
    expect(render().querySelector('#default')!.classList).toContain('sn-button-secondary');
  });

  it('supports the danger variant', () => {
    expect(render().querySelector('#danger')!.classList).toContain('sn-button-danger');
  });

  it('can be applied to a link', () => {
    const link = render().querySelector('#link')!;
    expect(link.classList).toContain('sn-button');
    expect(link.classList).toContain('sn-button-secondary');
  });
});

describe('SnIconButton', () => {
  it('labels the button and hides the decorative icon', () => {
    const button = render().querySelector('#icon')!;
    expect(button.getAttribute('aria-label')).toBe('Suivant');
    expect(button.classList).toContain('sn-button');
    expect(button.classList).toContain('sn-button-icon');
    expect(button.classList).not.toContain('sn-button-primary');
    const svg = button.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('20');
    expect(button.textContent!.trim()).toBe('');
  });

  it('does not submit forms by default', () => {
    expect(render().querySelector('#icon')!.getAttribute('type')).toBe('button');
  });

  it('uses the primary look in its dark variant', () => {
    expect(render().querySelector('#dark')!.classList).toContain('sn-button-primary');
  });
});
