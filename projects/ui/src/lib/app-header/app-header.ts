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
import { toInitials } from './to-initials';

export interface SnNavItem {
  label: string;
  link: string;
}

export interface SnHeaderUser {
  displayName: string;
}

type OpenMenu = 'user' | 'mobile' | null;

let nextId = 0;

/**
 * Application header: logo and name linking home, main navigation and user menu from desktop;
 * below desktop, both move into a mobile menu. Menus follow the disclosure pattern: Escape closes
 * them and returns focus to their button, a click outside or a navigation closes them.
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
          <div #userMenu class="sn-app-header-user">
            <button
              #userButton
              type="button"
              class="sn-app-header-user-button"
              [attr.aria-expanded]="openMenu() === 'user'"
              [attr.aria-controls]="userPanelId"
              (click)="toggle('user')"
            >
              <span class="sn-app-header-user-name">{{ currentUser.displayName }}</span>
              <span class="sn-app-header-initials" aria-hidden="true">{{ initials() }}</span>
            </button>
            @if (openMenu() === 'user') {
              <div class="sn-app-header-panel sn-app-header-user-panel" [id]="userPanelId">
                <ng-container *ngTemplateOutlet="logoutButton" />
              </div>
            }
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
              [routerLinkActiveOptions]="{ exact: item.link === homeLink() }"
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
    '(keydown)': 'onKeydown($event)',
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
  protected readonly userPanelId = `sn-app-header-user-panel-${this.id}`;
  protected readonly mobilePanelId = `sn-app-header-mobile-panel-${this.id}`;

  protected readonly openMenu = signal<OpenMenu>(null);
  protected readonly initials = computed(() => toInitials(this.user()?.displayName ?? ''));

  private readonly userMenu = viewChild<ElementRef<HTMLElement>>('userMenu');
  private readonly userButton = viewChild<ElementRef<HTMLButtonElement>>('userButton');
  private readonly mobileMenu = viewChild<ElementRef<HTMLElement>>('mobileMenu');
  private readonly menuButton = viewChild('menuButton', { read: ElementRef<HTMLButtonElement> });
  private readonly mobilePanel = viewChild<ElementRef<HTMLElement>>('mobilePanel');

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  protected toggle(menu: Exclude<OpenMenu, null>): void {
    this.openMenu.update((open) => (open === menu ? null : menu));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
  }

  protected onLogout(): void {
    this.closeMenu();
    this.logout.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const open = this.openMenu();
    if (event.key !== 'Escape' || open === null) return;
    event.preventDefault();
    this.closeMenu();
    const trigger = open === 'user' ? this.userButton() : this.menuButton();
    trigger?.nativeElement.focus();
  }

  /** A click outside the open menu (its button included) closes it. */
  protected onDocumentClick(event: MouseEvent): void {
    const open = this.openMenu();
    if (open === null) return;
    const target = event.target as Node | null;
    const inside =
      open === 'user'
        ? this.userMenu()?.nativeElement.contains(target)
        : this.mobileMenu()?.nativeElement.contains(target) ||
          this.mobilePanel()?.nativeElement.contains(target);
    if (!inside) this.closeMenu();
  }
}
