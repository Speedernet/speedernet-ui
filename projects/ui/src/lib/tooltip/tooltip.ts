import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';

let nextId = 0;

/**
 * Short text shown above its content on hover and keyboard focus. Wrap a single focusable
 * element: it gets `aria-describedby` pointing to the text. The text stays visible while the
 * pointer is over it and Escape hides it (WCAG 1.4.13). Never put essential information only
 * in a tooltip.
 */
@Component({
  selector: 'sn-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content />
    <span class="sn-tooltip-bubble" role="tooltip" [id]="id">
      <span class="sn-tooltip-text">{{ text() }}</span>
    </span>
  `,
  styleUrl: './tooltip.scss',
  host: {
    class: 'sn-tooltip',
    '[class.sn-tooltip-dismissed]': 'dismissed()',
    '(keydown.escape)': 'dismissed.set(true)',
    '(pointerenter)': 'dismissed.set(false)',
    '(focusin)': 'dismissed.set(false)',
  },
})
export class SnTooltip {
  readonly text = input.required<string>();
  protected readonly id = `sn-tooltip-${nextId++}`;
  protected readonly dismissed = signal(false);

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => {
      const trigger = host.firstElementChild;
      if (trigger && !trigger.classList.contains('sn-tooltip-bubble')) {
        trigger.setAttribute('aria-describedby', this.id);
      }
    });
  }
}
