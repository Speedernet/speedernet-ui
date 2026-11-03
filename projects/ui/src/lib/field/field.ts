import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { LucideCircleAlert, LucideDynamicIcon } from '@lucide/angular';
import { SpeedFieldContext } from './field-context';

let nextFieldId = 0;

/** Lays out a label, a control (`speedControl`), an optional hint and an optional error message. */
@Component({
  selector: 'speed-field',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <label class="speed-field-label" [attr.for]="controlId">{{ label() }}</label>
    <ng-content />
    @if (hint(); as hint) {
      <p class="speed-field-hint" [id]="hintId">{{ hint }}</p>
    }
    @if (error(); as error) {
      <p class="speed-field-error" [id]="errorId">
        <svg [lucideIcon]="alertIcon" [size]="18" aria-hidden="true"></svg>
        <span>{{ error }}</span>
      </p>
    }
  `,
  styleUrl: './field.scss',
  host: { class: 'speed-field' },
  providers: [{ provide: SpeedFieldContext, useExisting: SpeedField }],
})
export class SpeedField implements SpeedFieldContext {
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
