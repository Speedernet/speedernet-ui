import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { LucideChevronDown, LucideDynamicIcon } from '@lucide/angular';
import { SpeedFieldBase } from '../field/field-base';
import { SpeedFieldContext } from '../field/field-context';
import { FIELD_LABEL, FIELD_MESSAGES } from '../field/field-template';

/**
 * Drop-down list field: a label, the native `<select speedControl>` it wraps with a chevron, then
 * an optional hint and error, like `speed-field`. The native control keeps its keyboard
 * behaviour, its system list on phones and its form bindings.
 */
@Component({
  selector: 'speed-select',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    ${FIELD_LABEL}
    <div class="speed-select-control">
      <ng-content select="select" />
      <svg
        class="speed-select-chevron"
        [lucideIcon]="chevronIcon"
        [size]="20"
        aria-hidden="true"
      ></svg>
    </div>
    ${FIELD_MESSAGES}
  `,
  styleUrls: ['../field/field.scss', './select.scss'],
  host: { class: 'speed-field speed-select' },
  providers: [{ provide: SpeedFieldContext, useExisting: SpeedSelect }],
})
export class SpeedSelect extends SpeedFieldBase {
  protected readonly chevronIcon = LucideChevronDown.icon;
}
