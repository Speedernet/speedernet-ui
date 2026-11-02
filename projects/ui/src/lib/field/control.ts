import { Directive, inject } from '@angular/core';
import { SnFieldContext } from './field-context';

/**
 * Native control of an `sn-field`, `sn-checkbox`, `sn-radio` or `sn-switch`: receives its id,
 * `aria-invalid` and `aria-describedby`.
 */
@Directive({
  selector: 'input[snControl], select[snControl], textarea[snControl]',
  host: {
    '[id]': 'field.controlId',
    '[attr.aria-invalid]': "field.hasError() ? 'true' : null",
    '[attr.aria-describedby]': 'field.describedBy()',
  },
})
export class SnControl {
  protected readonly field: SnFieldContext = (() => {
    const field = inject(SnFieldContext, { optional: true });
    if (!field) {
      throw new Error(
        '[snControl] must be placed inside an <sn-field>, <sn-checkbox>, <sn-radio> or <sn-switch>.',
      );
    }
    return field;
  })();
}
