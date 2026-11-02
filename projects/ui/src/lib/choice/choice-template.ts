// Templates shared by the choice components (internal, not exported by the library).
const CHOICE_TEXT = `
  <span class="sn-choice-text">
    <label class="sn-choice-label" [attr.for]="controlId">{{ label() }}</label>
    @if (hint(); as hint) {
      <p class="sn-field-hint" [id]="hintId">{{ hint }}</p>
    }
    @if (error(); as error) {
      <p class="sn-field-error" [id]="errorId">
        <svg [lucideIcon]="alertIcon" [size]="18" aria-hidden="true"></svg>
        <span>{{ error }}</span>
      </p>
    }
  </span>
`;

/** Template of `sn-checkbox` and `sn-radio`. */
export const CHOICE_TEMPLATE = `
  <span class="sn-choice-control"><ng-content select="input" /></span>
  ${CHOICE_TEXT}
`;

/** Template of `sn-switch`: the drawn track sits under the native checkbox. */
export const SWITCH_TEMPLATE = `
  <span class="sn-choice-control">
    <ng-content select="input" />
    <span class="sn-switch-track" aria-hidden="true"></span>
  </span>
  ${CHOICE_TEXT}
`;
