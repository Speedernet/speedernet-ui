import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterOutlet, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LucideMenu, LucideX } from '@lucide/angular';
import { SpeedIconButton } from '../button/icon-button';
import { SpeedAppHeader, SpeedHeaderUser, SpeedNavItem } from './app-header';

let hostUser: SpeedHeaderUser | null = null;
let hostHomeLink = '/';

@Component({ template: `<p>Page</p>` })
class Page {}

/** Application shell: the header stays in place while the routed page changes. */
@Component({
  imports: [SpeedAppHeader, RouterOutlet],
  template: `
    <speed-app-header
      appName="Room booking"
      [homeLink]="homeLink"
      [navItems]="navItems"
      [user]="user"
      (logout)="onLogout()"
    />
    <button id="outside" type="button">Elsewhere</button>
    <router-outlet />
  `,
})
class Host {
  readonly navItems: SpeedNavItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Bookings', link: '/bookings' },
  ];
  readonly user = hostUser;
  readonly homeLink = hostHomeLink;
  logouts = 0;
  focusedOnLogout: Element | null = null;

  onLogout(): void {
    this.logouts++;
    this.focusedOnLogout = document.activeElement;
  }
}

async function setup(
  url = '/bookings',
  user: SpeedHeaderUser | null = { displayName: 'Camille Dupont' },
  homeLink = '/',
) {
  hostUser = user;
  hostHomeLink = homeLink;
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        {
          path: '',
          component: Host,
          children: [
            { path: '', component: Page },
            { path: 'bookings', component: Page },
            { path: 'home', component: Page },
          ],
        },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  const host = harness.fixture.debugElement.query(By.directive(Host)).componentInstance as Host;
  const root = harness.fixture.nativeElement as HTMLElement;
  document.body.appendChild(root);
  const header = () => root.querySelector('speed-app-header') as HTMLElement;
  const userButton = () =>
    header().querySelector('.speed-app-header-user-button') as HTMLButtonElement | null;
  const menuButton = () =>
    header().querySelector('.speed-app-header-menu-button') as HTMLButtonElement;
  const panel = (trigger: HTMLElement) =>
    document.getElementById(trigger.getAttribute('aria-controls')!) as HTMLElement | null;
  const detect = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
  };
  const menuIcon = () =>
    harness.fixture.debugElement
      .query(By.css('.speed-app-header-menu-button'))
      .injector.get(SpeedIconButton)
      .icon();
  return { harness, host, root, header, userButton, menuButton, panel, detect, menuIcon };
}

describe('SpeedAppHeader', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('links home with the decorative logo and the application name', async () => {
    const { header } = await setup();
    const home = header().querySelector('a.speed-app-header-home') as HTMLAnchorElement;
    expect(home.getAttribute('href')).toBe('/');
    expect(home.querySelector('speed-logo img')!.getAttribute('alt')).toBe('');
    expect(home.textContent).toContain('Room booking');
  });

  it('renders the main navigation and marks only the active route', async () => {
    const { header } = await setup('/bookings');
    const nav = header().querySelector('nav.speed-app-header-nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Navigation principale');
    const [home, bookings] = Array.from(nav.querySelectorAll('a'));
    expect(home.textContent).toContain('Home');
    expect(bookings.getAttribute('href')).toBe('/bookings');
    expect(bookings.getAttribute('aria-current')).toBe('page');
    expect(bookings.classList).toContain('speed-nav-active');
    expect(home.hasAttribute('aria-current')).toBe(false);
    expect(home.classList).not.toContain('speed-nav-active');
  });

  it('marks the home item active only on the home page', async () => {
    const { header } = await setup('/');
    const [home, bookings] = Array.from(header().querySelectorAll('nav.speed-app-header-nav a'));
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(bookings.hasAttribute('aria-current')).toBe(false);
  });

  it('never marks a "/" item active on other pages, even with another home link', async () => {
    const { header } = await setup('/bookings', undefined, '/home');
    const [home, bookings] = Array.from(header().querySelectorAll('nav.speed-app-header-nav a'));
    expect(home.hasAttribute('aria-current')).toBe(false);
    expect(home.classList).not.toContain('speed-nav-active');
    expect(bookings.getAttribute('aria-current')).toBe('page');
  });

  describe('user menu', () => {
    // jsdom ignores media queries, so the mobile `display: none` would make the button unfocusable.
    beforeEach(() => {
      const desktop = document.createElement('style');
      desktop.textContent = '.speed-app-header-user { display: block !important; }';
      document.body.appendChild(desktop);
    });

    it('shows the name and decorative initials, collapsed', async () => {
      const { userButton } = await setup();
      const button = userButton()!;
      expect(button.getAttribute('type')).toBe('button');
      expect(button.textContent).toContain('Camille Dupont');
      const initials = button.querySelector('.speed-app-header-initials')!;
      expect(initials.textContent!.trim()).toBe('CD');
      expect(initials.getAttribute('aria-hidden')).toBe('true');
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens on click and emits logout from the menu', async () => {
      const { userButton, panel, detect, host } = await setup();
      const button = userButton()!;
      expect(panel(button)!.hidden).toBe(true);
      button.click();
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(panel(button)!.hidden).toBe(false);
      const logout = Array.from(panel(button)!.querySelectorAll('button')).find((b) =>
        b.textContent!.includes('Se déconnecter'),
      )!;
      expect(logout).toBeTruthy();
      logout.click();
      await detect();
      expect(host.logouts).toBe(1);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes on Escape and returns focus to its button', async () => {
      const { userButton, panel, detect } = await setup();
      const button = userButton()!;
      button.click();
      await detect();
      const logout = panel(button)!.querySelector('button')!;
      logout.focus();
      logout.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(panel(button)!.hidden).toBe(true);
      expect(document.activeElement).toBe(button);
    });

    it('closes on Escape even when focus is outside the header', async () => {
      const { userButton, panel, detect } = await setup();
      const button = userButton()!;
      button.click();
      await detect();
      (document.activeElement as HTMLElement | null)?.blur();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(panel(button)!.hidden).toBe(true);
      expect(document.activeElement).toBe(button);
    });

    it('returns focus to its button before emitting logout', async () => {
      const { userButton, panel, detect, host } = await setup();
      const button = userButton()!;
      button.click();
      await detect();
      const logout = panel(button)!.querySelector('button')!;
      logout.focus();
      logout.click();
      await detect();
      expect(host.focusedOnLogout).toBe(button);
      expect(document.activeElement).toBe(button);
    });

    it('is a speed-menu labelled by the button, with logout as a menu item', async () => {
      const { userButton, panel } = await setup();
      const button = userButton()!;
      const menu = panel(button)!;
      expect(button.getAttribute('aria-haspopup')).toBe('menu');
      expect(menu.tagName).toBe('SPEED-MENU');
      expect(menu.getAttribute('role')).toBe('menu');
      expect(menu.getAttribute('aria-labelledby')).toBe(button.id);
      const item = menu.querySelector('[role="menuitem"]')!;
      expect(item.textContent).toContain('Se déconnecter');
      expect(item.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('opens with Arrow down on its first item', async () => {
      const { userButton, panel, detect } = await setup();
      const button = userButton()!;
      button.focus();
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await detect();
      expect(document.activeElement).toBe(panel(button)!.querySelector('[role="menuitem"]'));
    });

    it('shows the full name as a title, the visible name being truncated if needed', async () => {
      const { userButton } = await setup();
      const name = userButton()!.querySelector('.speed-app-header-user-name')!;
      expect(name.getAttribute('title')).toBe('Camille Dupont');
      expect(name.textContent!.trim()).toBe('Camille Dupont');
    });

    it('closes when clicking outside', async () => {
      const { root, userButton, detect } = await setup();
      const button = userButton()!;
      button.click();
      await detect();
      (root.querySelector('#outside') as HTMLButtonElement).click();
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('mobile menu', () => {
    it('is an icon button controlling a collapsed panel', async () => {
      const { menuButton, menuIcon } = await setup();
      const button = menuButton();
      expect(button.getAttribute('aria-label')).toBe('Ouvrir le menu');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-controls')).toBeTruthy();
      expect(menuIcon()).toBe(LucideMenu.icon);
    });

    it('opens with the same links and logout, and becomes a close button', async () => {
      const { menuButton, panel, detect, menuIcon } = await setup();
      const button = menuButton();
      button.click();
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-label')).toBe('Fermer le menu');
      expect(menuIcon()).toBe(LucideX.icon);
      const content = panel(button)!;
      const nav = content.querySelector('nav')!;
      expect(nav.getAttribute('aria-label')).toBe('Navigation principale');
      expect(Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
        '/',
        '/bookings',
      ]);
      expect(content.textContent).toContain('Se déconnecter');
    });

    it('closes when a link to another page is chosen', async () => {
      const { menuButton, panel, detect, harness } = await setup('/bookings');
      const button = menuButton();
      button.click();
      await detect();
      (panel(button)!.querySelector('a[href="/"]') as HTMLAnchorElement).click();
      await detect();
      expect(harness.routeNativeElement!.textContent).toContain('Page');
      expect(TestBed.inject(Router).url).toBe('/');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(panel(button)).toBeNull();
    });

    it('closes when the link of the current page is chosen', async () => {
      const { menuButton, panel, detect } = await setup('/bookings');
      const button = menuButton();
      button.click();
      await detect();
      (panel(button)!.querySelector('a[href="/bookings"]') as HTMLAnchorElement).click();
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes after any navigation', async () => {
      const { menuButton, detect, harness } = await setup('/bookings');
      const button = menuButton();
      button.click();
      await detect();
      await harness.navigateByUrl('/');
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('returns focus to the menu button before emitting logout', async () => {
      const { menuButton, panel, detect, host } = await setup();
      const button = menuButton();
      button.click();
      await detect();
      const logout = Array.from(panel(button)!.querySelectorAll('button')).find((b) =>
        b.textContent!.includes('Se déconnecter'),
      )!;
      logout.focus();
      logout.click();
      await detect();
      expect(host.logouts).toBe(1);
      expect(host.focusedOnLogout).toBe(button);
      expect(document.activeElement).toBe(button);
    });

    it('keeps only one menu open at a time', async () => {
      const { menuButton, userButton, detect } = await setup();
      userButton()!.click();
      await detect();
      menuButton().click();
      await detect();
      expect(userButton()!.getAttribute('aria-expanded')).toBe('false');
      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    });

    it('closes on Escape and returns focus to its button', async () => {
      const { menuButton, detect } = await setup();
      const button = menuButton();
      button.click();
      await detect();
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await detect();
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(button);
    });
  });

  it('shows neither user button nor logout without a user', async () => {
    const { header, userButton, menuButton, panel, detect } = await setup('/bookings', null);
    expect(userButton()).toBeNull();
    menuButton().click();
    await detect();
    expect(panel(menuButton())!.textContent).not.toContain('Se déconnecter');
    expect(header().textContent).not.toContain('Se déconnecter');
  });
});
