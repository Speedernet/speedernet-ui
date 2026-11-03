import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

let nextId = 0;

/** Item of an `speed-menu`, on a native `<button>`; the optional icon is decorative. */
@Component({
  selector: 'button[speedMenuItem]',
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
    class: 'speed-menu-item',
    '[class.speed-menu-item-danger]': "tone() === 'danger'",
  },
})
export class SpeedMenuItem {
  readonly icon = input<LucideIconData | null>(null);
  /** `danger` for a destructive action such as cancelling a booking. */
  readonly tone = input<'default' | 'danger'>('default');
  readonly element: HTMLButtonElement = inject(ElementRef).nativeElement;
}

/**
 * List of actions opened by a `button[speedMenuTrigger]` (menu button pattern):
 * `<button [speedMenuTrigger]="menu">…</button> <speed-menu #menu>…items…</speed-menu>`.
 * Arrow keys, Home and End move between items, a letter jumps to the next item starting with
 * it; Escape, a choice or a click outside closes the menu, and focus returns to the button
 * except when it moved elsewhere. The list opens in the top layer, next to its button.
 */
@Component({
  selector: 'speed-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  styleUrl: './menu.scss',
  host: {
    class: 'speed-menu',
    role: 'menu',
    '[id]': 'id',
    '[attr.popover]': "popover ? 'manual' : null",
    '[attr.aria-labelledby]': 'trigger()?.id ?? null',
    '[hidden]': '!isOpen()',
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onClick($event)',
    '(focusout)': 'onFocusOut($event)',
    // On the document: Safari and Firefox on macOS do not focus clicked buttons, so focus may
    // be outside the menu while it is open.
    '(document:keydown.escape)': 'onDocumentEscape($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SpeedMenu {
  /** Emitted each time the menu opens. */
  readonly opened = output<void>();

  readonly id = `speed-menu-${nextId++}`;

  // Without the Popover API (old browsers), the list is only fixed to the viewport: a scrolling
  // parent no longer clips it, a transformed one still would.
  protected readonly popover =
    typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

  private readonly openState = signal(false);
  /** True while the menu is open. */
  readonly isOpen = this.openState.asReadonly();
  protected readonly trigger = signal<SpeedMenuTrigger | null>(null);
  // Item to focus once the menu is rendered open.
  private readonly pendingFocus = signal<'first' | 'last' | null>(null);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    // The list opens in the top layer (Popover API), so a parent that clips its overflow, such
    // as a scrolling table, cannot cut it; it is then placed next to the button.
    afterRenderEffect(() => {
      if (this.isOpen()) {
        if (this.popover && !this.host.matches(':popover-open')) this.host.showPopover();
        this.place();
        window.addEventListener('scroll', this.place, true);
        window.addEventListener('resize', this.place);
      } else {
        if (this.popover && this.host.matches(':popover-open')) this.host.hidePopover();
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

  /** Called by `speedMenuTrigger`: the button that opens this menu and labels it. */
  attach(trigger: SpeedMenuTrigger): void {
    this.trigger.set(trigger);
  }

  /** Opens the menu and focuses its first item (or its last one). */
  open(focus: 'first' | 'last' = 'first'): void {
    if (!this.isOpen()) this.opened.emit();
    this.openState.set(true);
    this.pendingFocus.set(focus);
  }

  /** Closes the menu; with `restoreFocus`, focus goes back to its button. */
  close(restoreFocus = true): void {
    if (!this.isOpen()) return;
    this.openState.set(false);
    this.pendingFocus.set(null);
    if (restoreFocus) this.trigger()?.element.focus();
  }

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  /**
   * Right-aligned under the button; left-aligned when that would cross the left edge of the
   * screen, and above the button when there is no room below.
   */
  private readonly place = (): void => {
    const trigger = this.trigger();
    if (!trigger) return;
    const button = trigger.element.getBoundingClientRect();
    const { width, height } = this.host.getBoundingClientRect();
    const gap = 8;
    let left = button.right - width;
    if (left < gap) left = button.left;
    let top = button.bottom + gap;
    if (top + height > window.innerHeight - gap && button.top - gap - height >= gap) {
      top = button.top - gap - height;
    }
    this.host.style.left = `${Math.round(left)}px`;
    this.host.style.top = `${Math.round(top)}px`;
  };

  private stopFollowing(): void {
    window.removeEventListener('scroll', this.place, true);
    window.removeEventListener('resize', this.place);
  }

  protected onKeydown(event: KeyboardEvent): void {
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
        // Handled here: the document listener must not close it a second time.
        event.stopPropagation();
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
  protected onClick(event: MouseEvent): void {
    const item = (event.target as Element | null)?.closest('[role="menuitem"]');
    if (item && !(item as HTMLButtonElement).disabled) this.close();
  }

  protected onFocusOut(event: FocusEvent): void {
    const to = event.relatedTarget;
    if (this.isOpen() && to instanceof Node && !this.contains(to)) this.close(false);
  }

  protected onDocumentEscape(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();
    this.close();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.contains(event.target as Node | null)) this.close(false);
  }

  /** Inside the list or its button. */
  private contains(node: Node | null): boolean {
    return this.host.contains(node) || !!this.trigger()?.element.contains(node);
  }

  // Read from the DOM: items may reach the menu through a relayed <ng-content> (as in
  // `speed-action-menu`), which content queries do not see.
  private enabledItems(): HTMLButtonElement[] {
    return [...this.host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].filter(
      (element) => !element.disabled,
    );
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

/**
 * Turns any button into the opener of an `speed-menu`: `aria-haspopup`, `aria-expanded` and
 * `aria-controls`, a click toggles the menu, Arrow down and Arrow up open it on its first or last
 * item. The button keeps its own look and content.
 */
@Directive({
  selector: 'button[speedMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[id]': 'id',
    '[attr.aria-expanded]': 'menu().isOpen()',
    '[attr.aria-controls]': 'menu().id',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class SpeedMenuTrigger {
  readonly menu = input.required<SpeedMenu>({ alias: 'speedMenuTrigger' });
  readonly element: HTMLButtonElement = inject(ElementRef).nativeElement;
  readonly id = this.element.id || `speed-menu-trigger-${nextId++}`;

  constructor() {
    // Labels the menu as soon as both exist.
    effect(() => this.menu().attach(this));
  }

  protected onClick(): void {
    // Attached again here: the first click may come before the effect has run.
    this.menu().attach(this);
    this.menu().toggle();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.menu().attach(this);
      this.menu().open(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }
}
