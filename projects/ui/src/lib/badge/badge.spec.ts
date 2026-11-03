import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideCheck } from '@lucide/angular';
import { SpeedBadge } from './badge';
import { SpeedStatusBadge } from './status-badge';

@Component({
  imports: [SpeedBadge, SpeedStatusBadge],
  template: `
    <speed-badge id="plain">New</speed-badge>
    <speed-badge id="solid" tone="solid">Admin</speed-badge>
    <speed-badge id="icon" tone="primary" [icon]="check">Ok</speed-badge>
    <speed-status-badge id="status" status="pending" label="Pending" />
  `,
})
class Host {
  readonly check = LucideCheck.icon;
}

function render(): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('SpeedBadge', () => {
  it('is neutral by default and has no icon', () => {
    const badge = render().querySelector('#plain')!;
    expect(badge.classList).toContain('speed-badge');
    expect(badge.classList).toContain('speed-badge-neutral');
    expect(badge.querySelector('svg')).toBeNull();
    expect(badge.textContent!.trim()).toBe('New');
  });

  it('applies the tone class', () => {
    expect(render().querySelector('#solid')!.classList).toContain('speed-badge-solid');
  });

  it('renders a decorative 13px icon when given one', () => {
    const svg = render().querySelector('#icon svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('13');
  });
});

describe('SpeedStatusBadge', () => {
  it('shows the label with the tone and a decorative icon of its status', () => {
    const badge = render().querySelector('#status')!;
    expect(badge.textContent!.trim()).toBe('Pending');
    expect(badge.classList).toContain('speed-badge-accent');
    expect(badge.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });
});
