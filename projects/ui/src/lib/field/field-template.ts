// Templates shared by the field components (internal, not exported by the library).

/** Label of the field, linked to the native control. */
export const FIELD_LABEL = `
  <label class="speed-field-label" [attr.for]="controlId">{{ label() }}</label>
`;

/** Hint and error message under the control. */
export const FIELD_MESSAGES = `
  @if (hint(); as hint) {
    <p class="speed-field-hint" [id]="hintId">{{ hint }}</p>
  }
  @if (error(); as error) {
    <p class="speed-field-error" [id]="errorId">
      <svg [lucideIcon]="alertIcon" [size]="18" aria-hidden="true"></svg>
      <span>{{ error }}</span>
    </p>
  }
`;
