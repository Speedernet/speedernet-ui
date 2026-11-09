import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SpeedFieldBase } from './field-base';
import { SpeedFieldContext } from './field-context';
import { FIELD_LABEL, FIELD_MESSAGES } from './field-template';

/**
 * Lays out a label, a native text control (`speedControl` on an input or a textarea), an optional
 * hint and an optional error message. Drop-down lists and file pickers have their own field
 * components: `speed-select` and `speed-file-input`.
 */
@Component({
  selector: 'speed-field',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `${FIELD_LABEL}<ng-content />${FIELD_MESSAGES}`,
  styleUrl: './field.scss',
  host: { class: 'speed-field' },
  providers: [{ provide: SpeedFieldContext, useExisting: SpeedField }],
})
export class SpeedField extends SpeedFieldBase {}
