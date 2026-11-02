import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  viewChild,
} from '@angular/core';
import { LucideDynamicIcon, LucideEllipsis } from '@lucide/angular';
import { SnMenu, SnMenuTrigger } from '../menu/menu';

/**
 * "⋯" button that opens a list of actions, built on `sn-menu` and `snMenuTrigger`:
 * `<sn-action-menu label="…"><button snMenuItem>Modifier</button>…</sn-action-menu>`.
 */
@Component({
  selector: 'sn-action-menu',
  imports: [LucideDynamicIcon, SnMenu, SnMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      type="button"
      class="sn-button sn-button-icon sn-action-menu-trigger"
      [snMenuTrigger]="menu"
      [attr.aria-label]="label()"
    >
      <svg [lucideIcon]="ellipsisIcon" [size]="20" aria-hidden="true"></svg>
    </button>
    <sn-menu #menu><ng-content /></sn-menu>
  `,
  // Same stylesheet as SnButton for the trigger: Angular adds identical styles only once.
  styleUrls: ['../button/button.scss', './action-menu.scss'],
  host: { class: 'sn-action-menu' },
})
export class SnActionMenu {
  /** Accessible name of the button, for example "Actions pour la réservation du 12/03". */
  readonly label = input('Actions');

  protected readonly ellipsisIcon = LucideEllipsis.icon;
  private readonly menu = viewChild.required(SnMenu);

  /** Opens the menu and focuses its first item (or its last one). */
  open(focus: 'first' | 'last' = 'first'): void {
    this.menu().open(focus);
  }

  /** Closes the menu; with `restoreFocus`, focus goes back to the button. */
  close(restoreFocus = true): void {
    this.menu().close(restoreFocus);
  }
}
