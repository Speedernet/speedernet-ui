import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SpeedFieldContext } from '../field/field-context';
import { SpeedChoice } from './choice';
import { CHOICE_TEMPLATE } from './choice-template';

/**
 * Checkbox with its clickable label, an optional hint and error:
 * `<speed-checkbox label="…"><input type="checkbox" speedControl /></speed-checkbox>`.
 */
@Component({
  selector: 'speed-checkbox',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: CHOICE_TEMPLATE,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: { class: 'speed-choice speed-checkbox' },
  providers: [{ provide: SpeedFieldContext, useExisting: SpeedCheckbox }],
})
export class SpeedCheckbox extends SpeedChoice {}
