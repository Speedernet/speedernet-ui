import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SnFieldContext } from '../field/field-context';
import { SnChoice } from './choice';
import { SWITCH_TEMPLATE } from './choice-template';

/**
 * On/off switch for a setting that applies at once, with its clickable label, an optional hint
 * and error: `<sn-switch label="…"><input type="checkbox" role="switch" snControl /></sn-switch>`.
 * The native checkbox stays focusable and clickable over the drawn track.
 */
@Component({
  selector: 'sn-switch',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: SWITCH_TEMPLATE,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: { class: 'sn-choice sn-switch' },
  providers: [{ provide: SnFieldContext, useExisting: SnSwitch }],
})
export class SnSwitch extends SnChoice {}
