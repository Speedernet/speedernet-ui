import type { Signal } from '@angular/core';

/**
 * What a native control (`speedControl`) needs from the component around it: its id, its
 * description and its error state. Provided by `speed-field`, `speed-select`, `speed-file-input`,
 * `speed-checkbox`, `speed-radio` and `speed-switch`.
 */
export abstract class SpeedFieldContext {
  abstract readonly controlId: string;
  abstract readonly describedBy: Signal<string | null>;
  abstract readonly hasError: Signal<boolean>;
}
