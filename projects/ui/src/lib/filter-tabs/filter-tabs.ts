import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
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
          [attr.tabindex]="$index === tabStopIndex() ? 0 : -1"
          (click)="value.set(option.value)"
          (keydown)="onKeydown($event)"
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

  /** Selected tab, or the first one when the value matches no option, so the control stays reachable. */
  protected readonly tabStopIndex = computed(() =>
    Math.max(
      0,
      this.options().findIndex((option) => option.value === this.value()),
    ),
  );

  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const options = this.options();
    const current = this.tabStopIndex();
    const next = nextTabIndex(current, event.key, options.length);
    if (next === current) return;
    event.preventDefault();
    this.value.set(options[next].value);
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
}
