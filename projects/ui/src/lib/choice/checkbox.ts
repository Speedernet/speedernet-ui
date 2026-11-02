import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SnFieldContext } from '../field/field-context';
import { SnChoice } from './choice';
import { CHOICE_TEMPLATE } from './choice-template';

/**
 * Checkbox with its clickable label, an optional hint and error:
 * `<sn-checkbox label="…"><input type="checkbox" snControl /></sn-checkbox>`.
 */
@Component({
  selector: 'sn-checkbox',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: CHOICE_TEMPLATE,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: { class: 'sn-choice sn-checkbox' },
  providers: [{ provide: SnFieldContext, useExisting: SnCheckbox }],
})
export class SnCheckbox extends SnChoice {}
