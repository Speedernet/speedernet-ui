import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/** Speedernet button, applied to a native `<button>` or `<a>`. */
@Component({
  selector: 'button[speedButton], a[speedButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  styleUrl: './button.scss',
  host: {
    class: 'speed-button',
    '[class.speed-button-primary]': "variant() === 'primary'",
    '[class.speed-button-secondary]': "variant() === 'secondary'",
    '[class.speed-button-danger]': "variant() === 'danger'",
  },
})
export class SpeedButton {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('secondary');
}
