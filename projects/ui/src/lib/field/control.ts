import { Directive, inject } from '@angular/core';
import { SnField } from './field';

/** Native control of an `sn-field`: receives its id, `aria-invalid` and `aria-describedby`. */
@Directive({
  selector: 'input[snControl], select[snControl], textarea[snControl]',
  host: {
    '[id]': 'field.controlId',
    '[attr.aria-invalid]': "field.hasError() ? 'true' : null",
    '[attr.aria-describedby]': 'field.describedBy()',
  },
})
export class SnControl {
  protected readonly field: SnField = (() => {
    const field = inject(SnField, { optional: true });
    if (!field) {
      throw new Error('[snControl] must be placed inside an <sn-field>.');
    }
    return field;
  })();
}
