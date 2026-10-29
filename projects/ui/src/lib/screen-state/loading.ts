import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/** Loading placeholder: a label and animated grey lines (animation stops with reduced motion). */
@Component({
  selector: 'sn-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="sn-loading-label">
      <span class="sn-loading-spinner" aria-hidden="true"></span>
      <span>{{ label() }}</span>
    </span>
    <span class="sn-loading-line" aria-hidden="true"></span>
    <span class="sn-loading-line" aria-hidden="true"></span>
    <span class="sn-loading-line" aria-hidden="true"></span>
  `,
  styleUrl: './screen-state.scss',
  host: { class: 'sn-loading', role: 'status' },
})
export class SnLoading {
  readonly label = input.required<string>();
}
