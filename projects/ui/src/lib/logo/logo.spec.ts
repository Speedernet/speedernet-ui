import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SN_ASSETS_BASE } from '../assets-base';
import { SnLogo } from './logo';

@Component({
  imports: [SnLogo],
  template: `<sn-logo [variant]="variant" />`,
})
class Host {
  variant: 'mark' | 'full' = 'mark';
}

function render(variant: 'mark' | 'full' = 'mark', base?: string): HTMLImageElement {
  TestBed.configureTestingModule({
    providers: base ? [{ provide: SN_ASSETS_BASE, useValue: base }] : [],
  });
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.variant = variant;
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('img');
}

describe('SnLogo', () => {
  it('shows the mark by default with an empty alt', () => {
    const img = render();
    expect(img.getAttribute('src')).toBe('/speedernet-ui/logos/logo-speedernet-min.svg');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('shows the full logo', () => {
    expect(render('full').getAttribute('src')).toMatch(/logo-speedernet-full\.svg$/);
  });

  it('uses the configured assets base', () => {
    expect(render('mark', '/static/ui').getAttribute('src')).toMatch(/^\/static\/ui\/logos\//);
  });
});
