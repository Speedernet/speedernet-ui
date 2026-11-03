import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideCheck } from '@lucide/angular';
import { SnBadge } from './badge';
import { SnStatusBadge } from './status-badge';

@Component({
  imports: [SnBadge, SnStatusBadge],
  template: `
    <sn-badge id="plain">New</sn-badge>
    <sn-badge id="solid" tone="solid">Admin</sn-badge>
    <sn-badge id="icon" tone="primary" [icon]="check">Ok</sn-badge>
    <sn-status-badge id="status" status="pending" label="Pending" />
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

describe('SnBadge', () => {
  it('is neutral by default and has no icon', () => {
    const badge = render().querySelector('#plain')!;
    expect(badge.classList).toContain('sn-badge');
    expect(badge.classList).toContain('sn-badge-neutral');
    expect(badge.querySelector('svg')).toBeNull();
    expect(badge.textContent!.trim()).toBe('New');
  });

  it('applies the tone class', () => {
    expect(render().querySelector('#solid')!.classList).toContain('sn-badge-solid');
  });

  it('renders a decorative 13px icon when given one', () => {
    const svg = render().querySelector('#icon svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('13');
  });
});

describe('SnStatusBadge', () => {
  it('shows the label with the tone and a decorative icon of its status', () => {
    const badge = render().querySelector('#status')!;
    expect(badge.textContent!.trim()).toBe('Pending');
    expect(badge.classList).toContain('sn-badge-accent');
    expect(badge.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });
});
