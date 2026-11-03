import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SpeedFieldContext } from '../field/field-context';
import { SpeedChoice } from './choice';
import { CHOICE_TEMPLATE } from './choice-template';

/**
 * Radio button with its clickable label and an optional hint, inside an `speed-radio-group`:
 * `<speed-radio label="…"><input type="radio" name="…" speedControl /></speed-radio>`.
 */
@Component({
  selector: 'speed-radio',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: CHOICE_TEMPLATE,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: { class: 'speed-choice speed-radio' },
  providers: [{ provide: SpeedFieldContext, useExisting: SpeedRadio }],
})
export class SpeedRadio extends SpeedChoice {}
