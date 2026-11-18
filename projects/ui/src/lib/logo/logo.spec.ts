import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SpeedLogo } from './logo';

@Component({
  imports: [SpeedLogo],
  template: `<speed-logo [variant]="variant()" [alt]="alt()" />`,
})
class Host {
  readonly variant = signal<'mark' | 'full'>('mark');
  readonly alt = signal('');
}

@Component({
  imports: [SpeedLogo],
  template: `<speed-logo variant="mark" /><speed-logo variant="full" />`,
})
class BothLogos {}

function render(variant: 'mark' | 'full' = 'mark', alt = ''): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.variant.set(variant);
  fixture.componentInstance.alt.set(alt);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('speed-logo');
}

describe('SpeedLogo', () => {
  it('shows the mark inline by default, hidden from assistive technologies', () => {
    const logo = render();
    expect(logo.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 481.9 506.1');
    expect(logo.getAttribute('aria-hidden')).toBe('true');
    expect(logo.getAttribute('role')).toBeNull();
  });

  it('shows the full logo', () => {
    expect(render('full').querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 3359 840.1');
  });

  it('is an image labelled by its alt', () => {
    const logo = render('mark', 'Logo Speedernet');
    expect(logo.getAttribute('role')).toBe('img');
    expect(logo.getAttribute('aria-label')).toBe('Logo Speedernet');
    expect(logo.getAttribute('aria-hidden')).toBeNull();
  });

  it('keeps the two logos colors apart when both are on the page', () => {
    const page = TestBed.createComponent(BothLogos);
    page.detectChanges();
    const html = (page.nativeElement as HTMLElement).innerHTML;
    expect(html).not.toContain('<style');
    expect(html).not.toContain('class="st');
  });
});
