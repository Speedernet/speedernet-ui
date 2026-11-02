import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  contentChildren,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { LucideDynamicIcon, LucideEllipsis, type LucideIconData } from '@lucide/angular';

let nextId = 0;

/** Item of an `sn-action-menu`, on a native `<button>`; the optional icon is decorative. */
@Component({
  selector: 'button[snMenuItem]',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (icon(); as icon) {
      <svg [lucideIcon]="icon" [size]="18" aria-hidden="true"></svg>
    }
    <ng-content />
  `,
  host: {
    type: 'button',
    role: 'menuitem',
    tabindex: '-1',
    class: 'sn-menu-item',
    '[class.sn-menu-item-danger]': "tone() === 'danger'",
  },
})
export class SnMenuItem {
  readonly icon = input<LucideIconData | null>(null);
  /** `danger` for a destructive action such as cancelling a booking. */
  readonly tone = input<'default' | 'danger'>('default');
  readonly element: HTMLButtonElement = inject(ElementRef).nativeElement;
}

/**
 * "⋯" button that opens a list of actions (menu button pattern). Arrow keys, Home and End move
 * between items, a letter jumps to the next item starting with it; Escape, a choice or a click
 * outside closes the menu, and focus returns to the button except when it moved elsewhere.
 */
@Component({
  selector: 'sn-action-menu',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      #trigger
      type="button"
      class="sn-button sn-button-icon sn-action-menu-trigger"
      aria-haspopup="menu"
      [id]="triggerId"
      [attr.aria-label]="label()"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="menuId"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <svg [lucideIcon]="ellipsisIcon" [size]="20" aria-hidden="true"></svg>
    </button>
    <div
      #menu
      class="sn-action-menu-list"
      role="menu"
      [attr.popover]="popover ? 'manual' : null"
      [id]="menuId"
      [attr.aria-labelledby]="triggerId"
      [hidden]="!isOpen()"
      (keydown)="onMenuKeydown($event)"
      (click)="onMenuClick($event)"
      (focusout)="onFocusOut($event)"
    >
      <ng-content />
    </div>
  `,
  // Same stylesheet as SnButton for the trigger: Angular adds identical styles only once.
  styleUrls: ['../button/button.scss', './action-menu.scss'],
  host: {
    class: 'sn-action-menu',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SnActionMenu {
  /** Accessible name of the button, for example "Actions pour la réservation du 12/03". */
  readonly label = input('Actions');

  protected readonly ellipsisIcon = LucideEllipsis.icon;
  private readonly id = nextId++;
  protected readonly triggerId = `sn-action-menu-trigger-${this.id}`;
  protected readonly menuId = `sn-action-menu-list-${this.id}`;

  // Without the Popover API (old browsers), the list is only fixed to the viewport: a scrolling
  // parent no longer clips it, a transformed one still would.
  protected readonly popover =
    typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

  protected readonly isOpen = signal(false);
  // Item to focus once the menu is rendered open.
  private readonly pendingFocus = signal<'first' | 'last' | null>(null);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('menu');
  private readonly items = contentChildren(SnMenuItem, { descendants: true });

  constructor() {
    // The list opens in the top layer (Popover API), so a parent that clips its overflow, such
    // as a scrolling table, cannot cut it; it is then placed next to the button.
    afterRenderEffect(() => {
      const list = this.list().nativeElement;
      if (this.isOpen()) {
        if (this.popover && !list.matches(':popover-open')) list.showPopover();
        this.place();
        window.addEventListener('scroll', this.place, true);
        window.addEventListener('resize', this.place);
      } else {
        if (this.popover && list.matches(':popover-open')) list.hidePopover();
        this.stopFollowing();
      }
    });
    inject(DestroyRef).onDestroy(() => this.stopFollowing());
    afterRenderEffect(() => {
      const target = this.pendingFocus();
      if (!target || !this.isOpen()) return;
      this.pendingFocus.set(null);
      const items = this.enabledItems();
      (target === 'first' ? items[0] : items[items.length - 1])?.focus();
    });
  }

  /**
   * Right-aligned under the button; left-aligned when that would cross the left edge of the
   * screen, and above the button when there is no room below.
   */
  private readonly place = (): void => {
    const list = this.list().nativeElement;
    const button = this.trigger().nativeElement.getBoundingClientRect();
    const { width, height } = list.getBoundingClientRect();
    const gap = 8;
    let left = button.right - width;
    if (left < gap) left = button.left;
    let top = button.bottom + gap;
    if (top + height > window.innerHeight - gap && button.top - gap - height >= gap) {
      top = button.top - gap - height;
    }
    list.style.left = `${Math.round(left)}px`;
    list.style.top = `${Math.round(top)}px`;
  };

  private stopFollowing(): void {
    window.removeEventListener('scroll', this.place, true);
    window.removeEventListener('resize', this.place);
  }

  /** Opens the menu and focuses its first item (or its last one). */
  open(focus: 'first' | 'last' = 'first'): void {
    this.isOpen.set(true);
    this.pendingFocus.set(focus);
  }

  /** Closes the menu; with `restoreFocus`, focus goes back to the button. */
  close(restoreFocus = true): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.pendingFocus.set(null);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  protected toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.enabledItems();
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = items[(index + 1) % items.length];
        break;
      case 'ArrowUp':
        next = items[(index - 1 + items.length) % items.length];
        break;
      case 'Home':
        next = items[0];
        break;
      case 'End':
        next = items[items.length - 1];
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        return;
      case 'Tab':
        // Focus leaves the menu along the page order: close without taking it back.
        this.close(false);
        return;
      default:
        next = this.matchFirstLetter(items, index, event.key);
    }
    if (next) {
      event.preventDefault();
      next.focus();
    }
  }

  /** A chosen item closes the menu; its own click handler runs as usual. */
  protected onMenuClick(event: MouseEvent): void {
    const item = (event.target as Element | null)?.closest('[role="menuitem"]');
    if (item && !(item as HTMLButtonElement).disabled) this.close();
  }

  protected onFocusOut(event: FocusEvent): void {
    const to = event.relatedTarget;
    if (this.isOpen() && to instanceof Node && !this.host.contains(to)) this.close(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.contains(event.target as Node | null)) this.close(false);
  }

  private enabledItems(): HTMLButtonElement[] {
    return this.items()
      .map((item) => item.element)
      .filter((element) => !element.disabled);
  }

  private matchFirstLetter(
    items: HTMLButtonElement[],
    index: number,
    key: string,
  ): HTMLButtonElement | undefined {
    if (key.length !== 1 || !/\S/.test(key)) return undefined;
    const letter = key.toLocaleLowerCase('fr');
    const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
    return ordered.find((item) =>
      (item.textContent ?? '').trim().toLocaleLowerCase('fr').startsWith(letter),
    );
  }
}
