import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/** Speedernet button, applied to a native `<button>` or `<a>`. */
@Component({
  selector: 'button[snButton], a[snButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  styleUrl: './button.scss',
  host: {
    class: 'sn-button',
    '[class.sn-button-primary]': "variant() === 'primary'",
    '[class.sn-button-secondary]': "variant() === 'secondary'",
    '[class.sn-button-danger]': "variant() === 'danger'",
  },
})
export class SnButton {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('secondary');
}
