import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon, LucideLogOut, LucideMenu, LucideX } from '@lucide/angular';
import { filter } from 'rxjs';
import { SnIconButton } from '../button/icon-button';
import { SnLogo } from '../logo/logo';
import { SnMenu, SnMenuItem, SnMenuTrigger } from '../menu/menu';
import { toInitials } from './to-initials';

export interface SnNavItem {
  label: string;
  link: string;
}

export interface SnHeaderUser {
  displayName: string;
}

let nextId = 0;

/**
 * Application header: logo and name linking home, main navigation and user menu from desktop;
 * below desktop, both move into a mobile menu. The user menu is an `sn-menu`; the mobile menu,
 * which holds navigation links, follows the disclosure pattern: Escape closes it and returns
 * focus to its button, a click outside or a navigation closes it.
 */
@Component({
  selector: 'sn-app-header',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    SnLogo,
    SnIconButton,
    SnMenu,
    SnMenuItem,
    SnMenuTrigger,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="sn-app-header">
      <div class="sn-container sn-app-header-content">
        <a class="sn-app-header-home" [routerLink]="homeLink()">
          <sn-logo class="sn-app-header-logo" />
          <span class="sn-app-header-name">{{ appName() }}</span>
        </a>

        @if (navItems().length > 0) {
          <nav class="sn-app-header-nav" aria-label="Navigation principale">
            <ng-container *ngTemplateOutlet="links" />
          </nav>
        }

        @if (user(); as currentUser) {
          <div class="sn-app-header-user">
            <button type="button" class="sn-app-header-user-button" [snMenuTrigger]="userMenu">
              <span class="sn-app-header-user-name" [title]="currentUser.displayName">{{
                currentUser.displayName
              }}</span>
              <span class="sn-app-header-initials" aria-hidden="true">{{ initials() }}</span>
            </button>
            <sn-menu #userMenu (opened)="closeMenu()">
              <button snMenuItem [icon]="logoutIcon" (click)="onUserLogout()">
                {{ logoutLabel() }}
              </button>
            </sn-menu>
          </div>
        }

        @if (navItems().length > 0 || user()) {
          <div #mobileMenu class="sn-app-header-menu">
            <button
              #menuButton
              snIconButton
              class="sn-app-header-menu-button"
              [label]="openMenu() === 'mobile' ? 'Fermer le menu' : 'Ouvrir le menu'"
              [icon]="openMenu() === 'mobile' ? closeIcon : menuIcon"
              [attr.aria-expanded]="openMenu() === 'mobile'"
              [attr.aria-controls]="mobilePanelId"
              (click)="toggle('mobile')"
            ></button>
          </div>
        }
      </div>

      @if (openMenu() === 'mobile') {
        <div
          #mobilePanel
          class="sn-app-header-panel sn-app-header-mobile-panel"
          [id]="mobilePanelId"
        >
          @if (navItems().length > 0) {
            <nav class="sn-app-header-panel-nav" aria-label="Navigation principale">
              <ng-container *ngTemplateOutlet="links" />
            </nav>
          }
          @if (user(); as currentUser) {
            <p class="sn-app-header-panel-user">{{ currentUser.displayName }}</p>
            <ng-container *ngTemplateOutlet="logoutButton" />
          }
        </div>
      }
    </header>

    <ng-template #links>
      <ul class="sn-app-header-links">
        @for (item of navItems(); track item.link) {
          <li>
            <a
              class="sn-app-header-link"
              [routerLink]="item.link"
              routerLinkActive="sn-nav-active"
              ariaCurrentWhenActive="page"
              [routerLinkActiveOptions]="{ exact: item.link === '/' || item.link === homeLink() }"
              (click)="closeMenu()"
              ><span>{{ item.label }}</span></a
            >
          </li>
        }
      </ul>
    </ng-template>

    <ng-template #logoutButton>
      <button type="button" class="sn-app-header-panel-item" (click)="onLogout()">
        <svg [lucideIcon]="logoutIcon" [size]="20" aria-hidden="true"></svg>
        {{ logoutLabel() }}
      </button>
    </ng-template>
  `,
  styleUrl: './app-header.scss',
  host: {
    // On the document: Safari and Firefox on macOS do not focus clicked buttons, so focus may
    // be outside the header while a menu is open.
    '(document:keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SnAppHeader {
  readonly appName = input.required<string>();
  readonly homeLink = input('/');
  readonly navItems = input<SnNavItem[]>([]);
  readonly user = input<SnHeaderUser | null>(null);
  readonly logoutLabel = input('Se déconnecter');

  readonly logout = output<void>();

  protected readonly menuIcon = LucideMenu.icon;
  protected readonly closeIcon = LucideX.icon;
  protected readonly logoutIcon = LucideLogOut.icon;

  private readonly id = nextId++;
  protected readonly mobilePanelId = `sn-app-header-mobile-panel-${this.id}`;

  protected readonly openMenu = signal<'mobile' | null>(null);
  protected readonly initials = computed(() => toInitials(this.user()?.displayName ?? ''));

  private readonly userMenu = viewChild(SnMenu);
  private readonly mobileMenu = viewChild<ElementRef<HTMLElement>>('mobileMenu');
  private readonly menuButton = viewChild('menuButton', { read: ElementRef<HTMLButtonElement> });
  private readonly mobilePanel = viewChild<ElementRef<HTMLElement>>('mobilePanel');

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeMenu();
        this.userMenu()?.close(false);
      });
  }

  protected toggle(menu: 'mobile'): void {
    this.openMenu.update((open) => (open === menu ? null : menu));
    // One menu open at a time.
    this.userMenu()?.close(false);
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
  }

  protected onLogout(): void {
    this.closeMenuAndFocusTrigger();
    this.logout.emit();
  }

  /** Logout from the user menu: focus goes back to the user button before the event. */
  protected onUserLogout(): void {
    this.userMenu()?.close();
    this.logout.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || this.openMenu() === null) return;
    event.preventDefault();
    this.closeMenuAndFocusTrigger();
  }

  /** Closes the mobile menu and gives focus back to its button. */
  private closeMenuAndFocusTrigger(): void {
    if (this.openMenu() === null) return;
    this.closeMenu();
    this.menuButton()?.nativeElement.focus();
  }

  /** A click outside the mobile menu (its button included) closes it. */
  protected onDocumentClick(event: MouseEvent): void {
    if (this.openMenu() === null) return;
    const target = event.target as Node | null;
    const inside =
      this.mobileMenu()?.nativeElement.contains(target) ||
      this.mobilePanel()?.nativeElement.contains(target);
    if (!inside) this.closeMenu();
  }
}
