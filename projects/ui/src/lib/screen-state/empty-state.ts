import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideCalendarX, LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

/** Empty screen: icon, title, explanation and a projected action. */
@Component({
  selector: 'sn-empty-state',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span class="sn-state-icon"
      ><svg [lucideIcon]="icon()" [size]="26" aria-hidden="true"></svg
    ></span>
    <strong>{{ title() }}</strong>
    <p>{{ text() }}</p>
    <ng-content />
  `,
  styleUrl: './screen-state.scss',
  host: { class: 'sn-empty-state' },
})
export class SnEmptyState {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly icon = input<LucideIconData>(LucideCalendarX.icon);
}
