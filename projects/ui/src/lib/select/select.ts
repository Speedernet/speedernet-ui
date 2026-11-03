import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideChevronDown, LucideDynamicIcon } from '@lucide/angular';

/**
 * Drop-down list: styles the native `<select speedControl>` it wraps and adds a chevron. The native
 * control keeps its keyboard behaviour, its system list on phones and its form bindings; label,
 * hint and error come from the surrounding `speed-field`.
 */
@Component({
  selector: 'speed-select',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content select="select" />
    <svg
      class="speed-select-chevron"
      [lucideIcon]="chevronIcon"
      [size]="20"
      aria-hidden="true"
    ></svg>
  `,
  styleUrl: './select.scss',
  host: { class: 'speed-select' },
})
export class SpeedSelect {
  protected readonly chevronIcon = LucideChevronDown.icon;
}
