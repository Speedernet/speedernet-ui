import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideCheck, LucideCircleAlert, LucideTriangleAlert } from '@lucide/angular';
import { SnInfoBanner } from './info-banner';
import { SnMessage } from './message';
import { messageAppearance } from './message-appearance';

describe('messageAppearance', () => {
  it('maps each type to a label, tone and icon', () => {
    expect(messageAppearance('success')).toEqual({
      label: "C'est fait",
      tone: 'solid',
      icon: LucideCheck.icon,
    });
    expect(messageAppearance('info')).toEqual({ label: 'Info', tone: 'primary', icon: null });
    expect(messageAppearance('warning')).toEqual({
      label: 'Attention',
      tone: 'accent',
      icon: LucideTriangleAlert.icon,
    });
    expect(messageAppearance('error')).toEqual({
      label: 'Erreur',
      tone: 'brand',
      icon: LucideCircleAlert.icon,
    });
  });
});

@Component({
  imports: [SnMessage, SnInfoBanner],
  template: `
    <sn-message type="error">Enregistrement impossible.</sn-message>
    <sn-message type="info">Rien à signaler.</sn-message>
    <sn-info-banner id="linked" href="/x">Nouveautés</sn-info-banner>
    <sn-info-banner id="plain">Maintenance ce soir</sn-info-banner>
  `,
})
class Host {}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('SnMessage', () => {
  it('is a status with the badge word and the projected text', () => {
    const message = setup().querySelector('sn-message')!;
    expect(message.getAttribute('role')).toBe('status');
    expect(message.querySelector('.sn-badge')!.textContent!.trim()).toBe('Erreur');
    expect(message.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(message.textContent).toContain('Enregistrement impossible.');
  });

  it('has no icon for the info type', () => {
    const message = setup().querySelectorAll('sn-message')[1];
    expect(message.querySelector('.sn-badge')!.textContent!.trim()).toBe('Info');
    expect(message.querySelector('svg')).toBeNull();
  });
});

describe('SnInfoBanner', () => {
  it('renders a link with the badge and a decorative arrow when href is set', () => {
    const banner = setup().querySelector('#linked')!;
    const link = banner.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/x');
    expect(link.querySelector('.sn-badge')!.textContent!.trim()).toBe('Info');
    expect(link.textContent).toContain('Nouveautés');
    const arrow = link.querySelector('svg')!;
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.getAttribute('width')).toBe('14');
  });

  it('renders a div instead of a link without href', () => {
    const banner = setup().querySelector('#plain')!;
    expect(banner.querySelector('a')).toBeNull();
    expect(banner.querySelector('div.sn-info-banner-body')).not.toBeNull();
    expect(banner.querySelector('svg')!.getAttribute('width')).toBe('14');
    expect(banner.textContent).toContain('Maintenance ce soir');
  });
});
