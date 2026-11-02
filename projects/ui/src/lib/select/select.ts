import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideChevronDown, LucideDynamicIcon } from '@lucide/angular';

/**
 * Drop-down list: styles the native `<select snControl>` it wraps and adds a chevron. The native
 * control keeps its keyboard behaviour, its system list on phones and its form bindings; label,
 * hint and error come from the surrounding `sn-field`.
 */
@Component({
  selector: 'sn-select',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content select="select" />
    <svg class="sn-select-chevron" [lucideIcon]="chevronIcon" [size]="20" aria-hidden="true"></svg>
  `,
  styleUrl: './select.scss',
  host: { class: 'sn-select' },
})
export class SnSelect {
  protected readonly chevronIcon = LucideChevronDown.icon;
}
