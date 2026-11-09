import { Directive, computed, input } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { SpeedFieldContext } from './field-context';

let nextFieldId = 0;

/**
 * Shared part of `speed-field`, `speed-select` and `speed-file-input`: a label above the native
 * control (`speedControl`), then an optional hint and error message, with the ids that link them.
 */
@Directive()
export abstract class SpeedFieldBase implements SpeedFieldContext {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);

  private readonly uid = `speed-field-${++nextFieldId}`;
  readonly controlId = `${this.uid}-control`;
  readonly hintId = `${this.uid}-hint`;
  readonly errorId = `${this.uid}-error`;

  protected readonly alertIcon = LucideCircleAlert.icon;

  /** True when an error message is currently shown. */
  readonly hasError = computed(() => !!this.error());

  /** Ids of the hint and error elements currently rendered, space separated, or null. */
  readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId : null, this.error() ? this.errorId : null].filter(
      (id): id is string => id !== null,
    );
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
