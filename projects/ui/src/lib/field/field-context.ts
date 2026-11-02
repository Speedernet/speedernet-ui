import type { Signal } from '@angular/core';

/**
 * What a native control (`snControl`) needs from the component around it: its id, its
 * description and its error state. Provided by `sn-field`, `sn-checkbox`, `sn-radio` and
 * `sn-switch`.
 */
export abstract class SnFieldContext {
  abstract readonly controlId: string;
  abstract readonly describedBy: Signal<string | null>;
  abstract readonly hasError: Signal<boolean>;
}
