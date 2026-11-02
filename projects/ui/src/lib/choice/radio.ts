import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SnFieldContext } from '../field/field-context';
import { SnChoice } from './choice';
import { CHOICE_TEMPLATE } from './choice-template';

/**
 * Radio button with its clickable label and an optional hint, inside an `sn-radio-group`:
 * `<sn-radio label="…"><input type="radio" name="…" snControl /></sn-radio>`.
 */
@Component({
  selector: 'sn-radio',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: CHOICE_TEMPLATE,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: { class: 'sn-choice sn-radio' },
  providers: [{ provide: SnFieldContext, useExisting: SnRadio }],
})
export class SnRadio extends SnChoice {}
