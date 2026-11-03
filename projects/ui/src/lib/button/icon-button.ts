import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

/** Icon-only button: the accessible name comes from `label`, the icon is decorative. */
@Component({
  selector: 'button[speedIconButton]',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<svg [lucideIcon]="icon()" [size]="20" aria-hidden="true"></svg>`,
  // Same stylesheet as SpeedButton: Angular adds identical styles to the page only once.
  styleUrl: './button.scss',
  host: {
    type: 'button',
    class: 'speed-button speed-button-icon',
    '[class.speed-button-primary]': "variant() === 'dark'",
    '[attr.aria-label]': 'label()',
  },
})
export class SpeedIconButton {
  readonly label = input.required<string>();
  readonly icon = input.required<LucideIconData>();
  readonly variant = input<'light' | 'dark'>('light');
}
