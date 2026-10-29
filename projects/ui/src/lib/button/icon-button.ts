import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

/** Icon-only button: the accessible name comes from `label`, the icon is decorative. */
@Component({
  selector: 'button[snIconButton]',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<svg [lucideIcon]="icon()" [size]="20" aria-hidden="true"></svg>`,
  // Same stylesheet as SnButton: Angular adds identical styles to the page only once.
  styleUrl: './button.scss',
  host: {
    class: 'sn-button sn-button-icon',
    '[class.sn-button-primary]': "variant() === 'dark'",
    '[attr.aria-label]': 'label()',
  },
})
export class SnIconButton {
  readonly label = input.required<string>();
  readonly icon = input.required<LucideIconData>();
  readonly variant = input<'light' | 'dark'>('light');
}
