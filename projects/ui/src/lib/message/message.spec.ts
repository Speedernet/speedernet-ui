import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideCheck, LucideCircleAlert, LucideTriangleAlert } from '@lucide/angular';
import { SpeedInfoBanner } from './info-banner';
import { SpeedMessage } from './message';
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
  imports: [SpeedMessage, SpeedInfoBanner],
  template: `
    <speed-message type="error">Could not save.</speed-message>
    <speed-message type="info">Nothing to report.</speed-message>
    <speed-info-banner id="linked" href="/x">What's new</speed-info-banner>
    <speed-info-banner id="plain">Maintenance tonight</speed-info-banner>
  `,
})
class Host {}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('SpeedMessage', () => {
  it('is a status with the badge word and the projected text', () => {
    const message = setup().querySelector('speed-message')!;
    expect(message.getAttribute('role')).toBe('status');
    expect(message.querySelector('.speed-badge')!.textContent!.trim()).toBe('Erreur');
    expect(message.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(message.textContent).toContain('Could not save.');
  });

  it('has no icon for the info type', () => {
    const message = setup().querySelectorAll('speed-message')[1];
    expect(message.querySelector('.speed-badge')!.textContent!.trim()).toBe('Info');
    expect(message.querySelector('svg')).toBeNull();
  });
});

describe('SpeedInfoBanner', () => {
  it('renders a link with the badge and a decorative arrow when href is set', () => {
    const banner = setup().querySelector('#linked')!;
    const link = banner.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/x');
    expect(link.querySelector('.speed-badge')!.textContent!.trim()).toBe('Info');
    expect(link.textContent).toContain("What's new");
    const arrow = link.querySelector('svg')!;
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.getAttribute('width')).toBe('14');
  });

  it('renders a div instead of a link without href', () => {
    const banner = setup().querySelector('#plain')!;
    expect(banner.querySelector('a')).toBeNull();
    expect(banner.querySelector('div.speed-info-banner-body')).not.toBeNull();
    expect(banner.querySelector('svg')!.getAttribute('width')).toBe('14');
    expect(banner.textContent).toContain('Maintenance tonight');
  });
});
