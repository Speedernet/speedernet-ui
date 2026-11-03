import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideCalendarX, LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

/** Empty screen: icon, title, explanation and a projected action. */
@Component({
  selector: 'speed-empty-state',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="speed-state-icon"
      ><svg [lucideIcon]="icon()" [size]="26" aria-hidden="true"></svg
    ></span>
    <strong>{{ title() }}</strong>
    <p>{{ text() }}</p>
    <ng-content />
  `,
  styleUrl: './screen-state.scss',
  host: { class: 'speed-empty-state' },
})
export class SpeedEmptyState {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly icon = input<LucideIconData>(LucideCalendarX.icon);
}
