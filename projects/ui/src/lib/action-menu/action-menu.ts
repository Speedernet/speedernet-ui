import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  viewChild,
} from '@angular/core';
import { LucideDynamicIcon, LucideEllipsis } from '@lucide/angular';
import { SpeedMenu, SpeedMenuTrigger } from '../menu/menu';

/**
 * "⋯" button that opens a list of actions, built on `speed-menu` and `speedMenuTrigger`:
 * `<speed-action-menu label="…"><button speedMenuItem>Edit</button>…</speed-action-menu>`.
 */
@Component({
  selector: 'speed-action-menu',
  imports: [LucideDynamicIcon, SpeedMenu, SpeedMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      type="button"
      class="speed-button speed-button-icon speed-action-menu-trigger"
      [speedMenuTrigger]="menu"
      [attr.aria-label]="label()"
    >
      <svg [lucideIcon]="ellipsisIcon" [size]="20" aria-hidden="true"></svg>
    </button>
    <speed-menu #menu><ng-content /></speed-menu>
  `,
  // Same stylesheet as SpeedButton for the trigger: Angular adds identical styles only once.
  styleUrls: ['../button/button.scss', './action-menu.scss'],
  host: { class: 'speed-action-menu' },
})
export class SpeedActionMenu {
  /** Accessible name of the button, for example "Actions for the booking on 12/03". */
  readonly label = input('Actions');

  protected readonly ellipsisIcon = LucideEllipsis.icon;
  private readonly menu = viewChild.required(SpeedMenu);

  /** Opens the menu and focuses its first item (or its last one). */
  open(focus: 'first' | 'last' = 'first'): void {
    this.menu().open(focus);
  }

  /** Closes the menu; with `restoreFocus`, focus goes back to the button. */
  close(restoreFocus = true): void {
    this.menu().close(restoreFocus);
  }
}
