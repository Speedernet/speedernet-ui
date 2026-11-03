import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SpeedFieldContext } from '../field/field-context';
import { SpeedChoice } from './choice';
import { SWITCH_TEMPLATE } from './choice-template';

/**
 * On/off switch for a setting that applies at once, with its clickable label, an optional hint
 * and error: `<speed-switch label="…"><input type="checkbox" role="switch" speedControl /></speed-switch>`.
 * The native checkbox stays focusable and clickable over the drawn track.
 */
@Component({
  selector: 'speed-switch',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: SWITCH_TEMPLATE,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: { class: 'speed-choice speed-switch' },
  providers: [{ provide: SpeedFieldContext, useExisting: SpeedSwitch }],
})
export class SpeedSwitch extends SpeedChoice {}
