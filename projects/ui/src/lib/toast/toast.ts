import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  Injectable,
  ViewEncapsulation,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { LucideDynamicIcon, LucideX } from '@lucide/angular';

/** How a toast ended: its action was used, or it was closed or timed out. */
export type SnToastResult = 'action' | 'dismissed';

export interface SnToastOptions {
  /** Label of an optional action button, for example "Annuler". */
  action?: string;
  /** Display time in milliseconds; defaults to 5 s, or 10 s with an action. */
  duration?: number;
}

export interface SnToastRef {
  /** Resolves once, when the toast goes away. */
  readonly result: Promise<SnToastResult>;
  /** Removes the toast now. */
  dismiss(): void;
}

interface Toast {
  id: number;
  message: string;
  action: string | null;
  remaining: number;
  startedAt: number;
  timer: ReturnType<typeof setTimeout> | null;
  resolve: (result: SnToastResult) => void;
}

const DEFAULT_DURATION = 5000;
const ACTION_DURATION = 10000;
const MAX_TOASTS = 3;

let nextId = 0;

/**
 * Stack of toasts at the bottom of the page, created by `SnToastService`. Messages are announced
 * through a polite live region; focus never moves to a toast. Timers stop while the pointer is
 * over the stack or focus is inside it. Escape closes the focused toast and focus goes back to
 * where it came from.
 */
@Component({
  selector: 'sn-toaster',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="sn-toast-announcer" role="status">
      @for (toast of announced(); track toast.id) {
        <span>{{ toast.message }}</span>
      }
    </div>
    <div
      class="sn-toast-stack"
      (mouseenter)="setHovered(true)"
      (mouseleave)="setHovered(false)"
      (focusin)="onFocusIn($event)"
      (focusout)="onFocusOut($event)"
    >
      @for (toast of toasts(); track toast.id) {
        <div class="sn-toast" [attr.data-toast]="toast.id" (keydown.escape)="close(toast)">
          <p class="sn-toast-message">{{ toast.message }}</p>
          @if (toast.action) {
            <button type="button" class="sn-toast-action" (click)="end(toast, 'action')">
              {{ toast.action }}
            </button>
          }
          <button
            type="button"
            class="sn-toast-close"
            [attr.aria-label]="closeLabel"
            (click)="close(toast)"
          >
            <svg [lucideIcon]="closeIcon" [size]="18" aria-hidden="true"></svg>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.scss',
  host: { class: 'sn-toaster' },
})
export class SnToaster {
  protected readonly closeIcon = LucideX.icon;
  protected readonly closeLabel = 'Fermer la notification';
  protected readonly toasts = signal<Toast[]>([]);
  // Only the latest message, in a new element each time so that a repeated message is announced.
  protected readonly announced = signal<Toast[]>([]);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private hovered = false;
  private focused = false;
  private returnFocus: HTMLElement | null = null;

  show(message: string, options: SnToastOptions = {}): SnToastRef {
    let resolve!: (result: SnToastResult) => void;
    const result = new Promise<SnToastResult>((r) => (resolve = r));
    const toast: Toast = {
      id: nextId++,
      message,
      action: options.action ?? null,
      remaining: options.duration ?? (options.action ? ACTION_DURATION : DEFAULT_DURATION),
      startedAt: 0,
      timer: null,
      resolve,
    };
    const current = this.toasts();
    for (const old of current.slice(0, Math.max(0, current.length - MAX_TOASTS + 1))) {
      this.end(old, 'dismissed');
    }
    this.toasts.update((list) => [...list, toast]);
    this.announced.set([toast]);
    if (!this.paused) this.start(toast);
    return { result, dismiss: () => this.end(toast, 'dismissed') };
  }

  protected close(toast: Toast): void {
    this.end(toast, 'dismissed');
  }

  protected end(toast: Toast, result: SnToastResult): void {
    if (!this.toasts().includes(toast)) return;
    this.stop(toast);
    const element = this.host.querySelector(`[data-toast="${toast.id}"]`);
    const hadFocus = !!element?.contains(document.activeElement);
    this.toasts.update((list) => list.filter((t) => t !== toast));
    if (hadFocus) {
      // The element is about to disappear: give focus back to where it came from.
      const target = this.returnFocus;
      this.returnFocus = null;
      this.focused = false;
      if (target?.isConnected) target.focus();
    }
    if (this.toasts().length === 0) this.hovered = false;
    toast.resolve(result);
    if (!this.paused) this.toasts().forEach((t) => this.start(t));
  }

  protected setHovered(hovered: boolean): void {
    this.hovered = hovered;
    this.update();
  }

  protected onFocusIn(event: FocusEvent): void {
    const from = event.relatedTarget;
    if (!this.focused && from instanceof HTMLElement && !this.host.contains(from)) {
      this.returnFocus = from;
    }
    this.focused = true;
    this.update();
  }

  protected onFocusOut(event: FocusEvent): void {
    const to = event.relatedTarget;
    if (to instanceof Node && this.host.contains(to)) return;
    this.focused = false;
    this.returnFocus = null;
    this.update();
  }

  private get paused(): boolean {
    return this.hovered || this.focused;
  }

  private update(): void {
    for (const toast of this.toasts()) {
      if (this.paused) this.stop(toast);
      else this.start(toast);
    }
  }

  private start(toast: Toast): void {
    if (toast.timer !== null) return;
    toast.startedAt = Date.now();
    toast.timer = setTimeout(() => this.end(toast, 'dismissed'), toast.remaining);
  }

  private stop(toast: Toast): void {
    if (toast.timer === null) return;
    clearTimeout(toast.timer);
    toast.timer = null;
    toast.remaining = Math.max(0, toast.remaining - (Date.now() - toast.startedAt));
  }
}

/**
 * Shows short-lived notifications ("Réservation supprimée") with an optional action ("Annuler").
 * Inject it early (in the constructor of the component that will use it): the live region is
 * added to the page then, so that screen readers are ready to announce the first message.
 */
@Injectable({ providedIn: 'root' })
export class SnToastService {
  private readonly toaster: ComponentRef<SnToaster>;

  constructor() {
    const appRef = inject(ApplicationRef);
    const document = inject(DOCUMENT);
    this.toaster = createComponent(SnToaster, { environmentInjector: inject(EnvironmentInjector) });
    appRef.attachView(this.toaster.hostView);
    document.body.appendChild(this.toaster.location.nativeElement);
    inject(DestroyRef).onDestroy(() => this.toaster.destroy());
  }

  /** Shows a toast; `result` tells whether its action was used. */
  show(message: string, options?: SnToastOptions): SnToastRef {
    const ref = this.toaster.instance.show(message, options);
    this.toaster.changeDetectorRef.detectChanges();
    return ref;
  }
}
