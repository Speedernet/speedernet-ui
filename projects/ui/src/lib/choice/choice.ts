import { Directive, computed, inject, input } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { SpeedFieldContext } from '../field/field-context';
import { SpeedRadioGroup } from './radio-group';

let nextId = 0;

/**
 * Shared part of `speed-checkbox`, `speed-radio` and `speed-switch`: a native input (`speedControl`) followed
 * by its clickable label, then an optional hint and error message under the label.
 */
@Directive()
export abstract class SpeedChoice implements SpeedFieldContext {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);

  private readonly uid = `speed-choice-${++nextId}`;
  readonly controlId = `${this.uid}-control`;
  readonly hintId = `${this.uid}-hint`;
  readonly errorId = `${this.uid}-error`;

  protected readonly alertIcon = LucideCircleAlert.icon;

  /** Radio group around a radio button: its error flags and describes every button. */
  protected readonly group = inject(SpeedRadioGroup, { optional: true });

  readonly hasError = computed(() => !!this.error() || !!this.group?.hasError());

  readonly describedBy = computed(() => {
    const ids = [
      this.hint() ? this.hintId : null,
      this.error() ? this.errorId : null,
      this.group?.hasError() ? this.group.errorId : null,
    ].filter((id): id is string => id !== null);
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
