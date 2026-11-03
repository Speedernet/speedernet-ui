// Templates shared by the choice components (internal, not exported by the library).
const CHOICE_TEXT = `
  <span class="speed-choice-text">
    <label class="speed-choice-label" [attr.for]="controlId">{{ label() }}</label>
    @if (hint(); as hint) {
      <p class="speed-field-hint" [id]="hintId">{{ hint }}</p>
    }
    @if (error(); as error) {
      <p class="speed-field-error" [id]="errorId">
        <svg [lucideIcon]="alertIcon" [size]="18" aria-hidden="true"></svg>
        <span>{{ error }}</span>
      </p>
    }
  </span>
`;

/** Template of `speed-checkbox` and `speed-radio`. */
export const CHOICE_TEMPLATE = `
  <span class="speed-choice-control"><ng-content select="input" /></span>
  ${CHOICE_TEXT}
`;

/** Template of `speed-switch`: the drawn track sits under the native checkbox. */
export const SWITCH_TEMPLATE = `
  <span class="speed-choice-control">
    <ng-content select="input" />
    <span class="speed-switch-track" aria-hidden="true"></span>
  </span>
  ${CHOICE_TEXT}
`;
