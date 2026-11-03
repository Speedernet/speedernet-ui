import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/** Loading placeholder: a label and animated grey lines (animation stops with reduced motion). */
@Component({
  selector: 'speed-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="speed-loading-label">
      <span class="speed-loading-spinner" aria-hidden="true"></span>
      <span>{{ label() }}</span>
    </span>
    <span class="speed-loading-lines" aria-hidden="true">
      <span class="speed-loading-line speed-loading-line-1"></span>
      <span class="speed-loading-line speed-loading-line-2"></span>
      <span class="speed-loading-line speed-loading-line-3"></span>
    </span>
  `,
  styleUrl: './screen-state.scss',
  host: { class: 'speed-loading', role: 'status' },
})
export class SpeedLoading {
  readonly label = input.required<string>();
}
