import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
  model,
} from '@angular/core';
import { nextTabIndex } from './next-tab-index';

export interface SnFilterOption {
  value: string;
  label: string;
}

/** Pills that filter one list (WAI-ARIA tabs, roving tabindex, selection follows focus). */
@Component({
  selector: 'sn-filter-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="sn-filter-tabs" role="tablist" [attr.aria-label]="label()">
      @for (option of options(); track option.value) {
        <button
          type="button"
          role="tab"
          class="sn-filter-tab"
          [attr.aria-selected]="option.value === value()"
          [attr.tabindex]="option.value === value() ? 0 : -1"
          (click)="value.set(option.value)"
          (keydown)="onKeydown($event, $index)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styleUrl: './filter-tabs.scss',
})
export class SnFilterTabs {
  readonly options = input.required<SnFilterOption[]>();
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    const next = nextTabIndex(index, event.key, options.length);
    if (next === index && !['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    this.value.set(options[next].value);
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
}
