import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { LucideCircleAlert, LucideDynamicIcon } from '@lucide/angular';

let nextId = 0;

/**
 * Group of `sn-radio` in a fieldset: the legend names the group, the hint describes it and the
 * error flags every radio button. Arrow keys move between buttons that share a `name`.
 */
@Component({
  selector: 'sn-radio-group',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <fieldset class="sn-radio-group-fieldset" [attr.aria-describedby]="describedBy()">
      <legend class="sn-field-label">{{ legend() }}</legend>
      <div class="sn-radio-group-options">
        <ng-content />
      </div>
      @if (hint(); as hint) {
        <p class="sn-field-hint" [id]="hintId">{{ hint }}</p>
      }
      @if (error(); as error) {
        <p class="sn-field-error" [id]="errorId">
          <svg [lucideIcon]="alertIcon" [size]="18" aria-hidden="true"></svg>
          <span>{{ error }}</span>
        </p>
      }
    </fieldset>
  `,
  styleUrls: ['../field/field.scss', './choice.scss'],
  host: {
    class: 'sn-radio-group',
    '[class.sn-radio-group-horizontal]': "orientation() === 'horizontal'",
  },
})
export class SnRadioGroup {
  readonly legend = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  private readonly uid = `sn-radio-group-${++nextId}`;
  readonly hintId = `${this.uid}-hint`;
  readonly errorId = `${this.uid}-error`;

  protected readonly alertIcon = LucideCircleAlert.icon;

  readonly hasError = computed(() => !!this.error());

  protected readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId : null, this.error() ? this.errorId : null].filter(
      (id): id is string => id !== null,
    );
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
