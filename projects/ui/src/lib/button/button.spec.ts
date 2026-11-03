import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideArrowRight } from '@lucide/angular';
import { SpeedButton } from './button';
import { SpeedIconButton } from './icon-button';

@Component({
  imports: [SpeedButton, SpeedIconButton],
  template: `
    <button id="primary" speedButton variant="primary">Confirm</button>
    <button id="default" speedButton>Cancel</button>
    <button id="danger" speedButton variant="danger">Delete</button>
    <a id="link" speedButton href="/somewhere">Go</a>
    <button id="icon" speedIconButton label="Next" [icon]="arrowRight"></button>
    <button id="dark" speedIconButton label="Next" [icon]="arrowRight" variant="dark"></button>
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

describe('SpeedButton', () => {
  it('applies the primary variant classes', () => {
    const button = render().querySelector('#primary')!;
    expect(button.classList).toContain('speed-button');
    expect(button.classList).toContain('speed-button-primary');
  });

  it('is secondary by default', () => {
    expect(render().querySelector('#default')!.classList).toContain('speed-button-secondary');
  });

  it('supports the danger variant', () => {
    expect(render().querySelector('#danger')!.classList).toContain('speed-button-danger');
  });

  it('can be applied to a link', () => {
    const link = render().querySelector('#link')!;
    expect(link.classList).toContain('speed-button');
    expect(link.classList).toContain('speed-button-secondary');
  });
});

describe('SpeedIconButton', () => {
  it('labels the button and hides the decorative icon', () => {
    const button = render().querySelector('#icon')!;
    expect(button.getAttribute('aria-label')).toBe('Next');
    expect(button.classList).toContain('speed-button');
    expect(button.classList).toContain('speed-button-icon');
    expect(button.classList).not.toContain('speed-button-primary');
    const svg = button.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('20');
    expect(button.textContent!.trim()).toBe('');
  });

  it('does not submit forms by default', () => {
    expect(render().querySelector('#icon')!.getAttribute('type')).toBe('button');
  });

  it('uses the primary look in its dark variant', () => {
    expect(render().querySelector('#dark')!.classList).toContain('speed-button-primary');
  });
});
