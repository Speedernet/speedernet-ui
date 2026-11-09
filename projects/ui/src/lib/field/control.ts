import { Directive, inject } from '@angular/core';
import { SpeedFieldContext } from './field-context';

/**
 * Native control of a `speed-field`, `speed-select`, `speed-file-input`, `speed-checkbox`,
 * `speed-radio` or `speed-switch`: receives its id, `aria-invalid` and `aria-describedby`.
 */
@Directive({
  selector: 'input[speedControl], select[speedControl], textarea[speedControl]',
  host: {
    '[id]': 'field.controlId',
    '[attr.aria-invalid]': "field.hasError() ? 'true' : null",
    '[attr.aria-describedby]': 'field.describedBy()',
  },
})
export class SpeedControl {
  protected readonly field: SpeedFieldContext = (() => {
    const field = inject(SpeedFieldContext, { optional: true });
    if (!field) {
      throw new Error(
        '[speedControl] must be placed inside a <speed-field>, <speed-select>, <speed-file-input>, <speed-checkbox>, <speed-radio> or <speed-switch>.',
      );
    }
    return field;
  })();
}
