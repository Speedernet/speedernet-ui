import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import {
  LucideArrowLeft,
  LucideCalendarPlus,
  LucideCopy,
  LucidePencil,
  LucideX,
} from '@lucide/angular';
import {
  SpeedActionMenu,
  SpeedBadge,
  SpeedButton,
  SpeedCard,
  SpeedCheckbox,
  SpeedConfirmDialog,
  SpeedControl,
  SpeedDialog,
  SpeedEmptyState,
  SpeedErrorState,
  SpeedField,
  SpeedFilterOption,
  SpeedFilterTabs,
  SpeedIconButton,
  SpeedInfoBanner,
  SpeedLoading,
  SpeedMenu,
  SpeedMenuItem,
  SpeedMenuTrigger,
  SpeedMessage,
  SpeedRadio,
  SpeedRadioGroup,
  SpeedSelect,
  SpeedStatusBadge,
  SpeedSwitch,
  SpeedToastRef,
  SpeedToastService,
  SpeedTooltip,
} from '@speedernet/ui';

@Component({
  selector: 'demo-components-page',
  imports: [
    SpeedActionMenu,
    SpeedBadge,
    SpeedButton,
    SpeedCard,
    SpeedCheckbox,
    SpeedConfirmDialog,
    SpeedControl,
    SpeedDialog,
    SpeedEmptyState,
    SpeedErrorState,
    SpeedField,
    SpeedFilterTabs,
    SpeedIconButton,
    SpeedInfoBanner,
    SpeedLoading,
    SpeedMenu,
    SpeedMenuItem,
    SpeedMenuTrigger,
    SpeedMessage,
    SpeedRadio,
    SpeedRadioGroup,
    SpeedSelect,
    SpeedStatusBadge,
    SpeedSwitch,
    SpeedTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <h1>The <span class="speed-highlight">components</span></h1>
    <p class="speed-text-muted">Every component in all its variants and states.</p>

    <h2>Buttons</h2>
    <div id="buttons" class="row">
      <button speedButton variant="primary" type="button">Book a room</button>
      <button speedButton variant="secondary" type="button">Cancel</button>
      <button speedButton variant="danger" type="button" (click)="dialog().open()">
        Delete the booking
      </button>
      <button speedButton variant="primary" type="button" disabled>Disabled</button>
      <a speedButton variant="secondary" href="/components#buttons">Link as a button</a>
    </div>
    <h3>Icon buttons</h3>
    <div class="row">
      <button speedIconButton label="Edit" [icon]="pencil" variant="light" type="button"></button>
      <button speedIconButton label="Back" [icon]="back" variant="dark" type="button"></button>
    </div>
    @if (deleted()) {
      <speed-message type="success">Booking of 12/03 deleted.</speed-message>
    }
    <speed-confirm-dialog
      title="Delete the booking of 12/03?"
      confirmLabel="Delete"
      (confirmed)="deleted.set(true)"
    >
      Croix-Rousse room, from 14:00 to 15:00. This cannot be undone.
    </speed-confirm-dialog>

    <h2>Dialog</h2>
    <div class="row">
      <button speedButton variant="secondary" type="button" (click)="formDialog.open()">
        With a form
      </button>
      <button speedButton variant="secondary" type="button" (click)="longDialog.open()">
        Long content
      </button>
      <button speedButton variant="secondary" type="button" (click)="infoDialog.open()">
        No actions
      </button>
      <button speedButton variant="danger" type="button" (click)="dialog().open()">
        Confirmation
      </button>
    </div>
    <p class="speed-text-muted">Last closed with: {{ lastClose() }}</p>
    <speed-dialog #formDialog title="Edit the booking" (dismissed)="lastClose.set('Escape')">
      <div class="stack">
        <speed-field label="Date" hint="Expected format: dd/mm/yyyy.">
          <input speedControl type="text" value="12/03/2026" />
        </speed-field>
        <speed-field label="Comment">
          <textarea speedControl rows="3"></textarea>
        </speed-field>
      </div>
      <button
        speedDialogActions
        speedButton
        type="button"
        (click)="closeWith(formDialog, 'Cancel')"
      >
        Cancel
      </button>
      <button
        speedDialogActions
        speedButton
        variant="primary"
        type="button"
        (click)="closeWith(formDialog, 'Save')"
      >
        Save
      </button>
    </speed-dialog>
    <speed-dialog #longDialog title="Room rules" (dismissed)="lastClose.set('Escape')">
      @for (n of rules; track n) {
        <p>
          Article {{ n }}. Rooms can be booked up to 30 days in advance, for a slot of four hours at
          most. Leave the room on time and leave it tidy.
        </p>
      }
      <button
        speedDialogActions
        speedButton
        variant="primary"
        type="button"
        (click)="closeWith(longDialog, 'Got it')"
      >
        Got it
      </button>
    </speed-dialog>
    <speed-dialog #infoDialog title="Confluence room" (dismissed)="lastClose.set('Escape')">
      <p>Projector, whiteboard, 12 seats. Close with Escape.</p>
    </speed-dialog>
    <h2>Action menu</h2>
    <div class="row">
      <speed-action-menu label="Actions for the booking of 12/03">
        <button speedMenuItem [icon]="pencil" (click)="menuChoice.set('Edit')">Edit</button>
        <button speedMenuItem [icon]="copy" (click)="menuChoice.set('Duplicate')">Duplicate</button>
        <button speedMenuItem [icon]="cancel" tone="danger" (click)="menuChoice.set('Cancel')">
          Cancel the booking
        </button>
      </speed-action-menu>
      <speed-action-menu label="Actions for the booking of 02/02 (past)">
        <button speedMenuItem (click)="menuChoice.set('Duplicate')">Duplicate</button>
        <button speedMenuItem disabled>Edit</button>
        <button speedMenuItem tone="danger" disabled>Cancel the booking</button>
      </speed-action-menu>
    </div>
    <h3>Menu on another button</h3>
    <p class="speed-text-muted">
      <code>speedMenuTrigger</code> opens an <code>speed-menu</code> from any button, like the user
      menu in the header.
    </p>
    <div class="row">
      <button speedButton type="button" [speedMenuTrigger]="exportMenu">Export</button>
      <speed-menu #exportMenu>
        <button speedMenuItem (click)="menuChoice.set('Export as PDF')">As PDF</button>
        <button speedMenuItem (click)="menuChoice.set('Export as spreadsheet')">
          As spreadsheet
        </button>
      </speed-menu>
    </div>
    <p class="speed-text-muted">
      With icons and a dangerous action, without icons with disabled actions, then on a regular
      button. Last choice: {{ menuChoice() }}
    </p>

    <h2>Badges</h2>
    <div class="row">
      @for (tone of tones; track tone) {
        <speed-badge [tone]="tone">{{ tone }}</speed-badge>
      }
      <speed-badge tone="primary" [icon]="calendar">With icon</speed-badge>
    </div>
    <h3>Statuses</h3>
    <div class="row">
      <speed-status-badge status="confirmed" label="Confirmed" />
      <speed-status-badge status="pending" label="Pending" />
      <speed-status-badge status="cancelled" label="Cancelled" />
      <speed-status-badge status="archived" label="Archived" />
    </div>

    <h2>Tooltip</h2>
    <div class="row">
      <speed-tooltip text="Edit the booking">
        <button speedIconButton label="Edit" [icon]="pencil" variant="light" type="button"></button>
      </speed-tooltip>
      <speed-tooltip text="Back to the list">
        <button speedButton variant="secondary" type="button">Back</button>
      </speed-tooltip>
    </div>

    <h2>Filters</h2>
    <speed-filter-tabs label="Booking period" [options]="filters" [(value)]="filter" />
    <p class="speed-text-muted">Selected filter: {{ filter() }}</p>

    <h2>Fields</h2>
    <div class="stack">
      <speed-field label="Date" hint="Expected format: dd/mm/yyyy.">
        <input speedControl type="text" value="12/03/2026" />
      </speed-field>
      <speed-field label="End date" error="This date does not exist. Expected format: dd/mm/yyyy.">
        <input speedControl type="text" value="31/02/2026" />
      </speed-field>
      <speed-field label="Comment">
        <textarea speedControl rows="3"></textarea>
      </speed-field>
      <speed-field label="Disabled field">
        <input speedControl type="text" value="Read-only" disabled />
      </speed-field>
    </div>

    <h3>Select</h3>
    <div class="stack">
      <speed-field label="Room">
        <speed-select>
          <select speedControl>
            <option value="" disabled selected>Choose a room</option>
            @for (room of rooms; track room) {
              <option>{{ room }}</option>
            }
          </select>
        </speed-select>
      </speed-field>
      <speed-field label="Time slot" hint="Slots last one hour.">
        <speed-select>
          <select speedControl>
            <option>09:00 - 10:00</option>
            <option selected>14:00 - 15:00</option>
            <option>16:00 - 17:00</option>
          </select>
        </speed-select>
      </speed-field>
      <speed-field label="Fallback room" error="Choose a fallback room.">
        <speed-select>
          <select speedControl>
            <option value="" disabled selected>Choose a room</option>
            @for (room of rooms; track room) {
              <option>{{ room }}</option>
            }
          </select>
        </speed-select>
      </speed-field>
      <speed-field label="Floor" hint="Set by the chosen room.">
        <speed-select>
          <select speedControl disabled>
            <option>3rd floor</option>
          </select>
        </speed-select>
      </speed-field>
    </div>

    <h3>Checkboxes</h3>
    <div class="stack">
      <speed-checkbox label="Add a video projector">
        <input type="checkbox" speedControl />
      </speed-checkbox>
      <speed-checkbox label="Recurring booking" hint="Every week, on the same day.">
        <input type="checkbox" speedControl checked />
      </speed-checkbox>
      <speed-checkbox label="I accept the room rules" error="Accept the rules to book.">
        <input type="checkbox" speedControl />
      </speed-checkbox>
      <speed-checkbox label="Wheelchair access (all rooms)">
        <input type="checkbox" speedControl checked disabled />
      </speed-checkbox>
      <speed-checkbox label="Catering (unavailable)">
        <input type="checkbox" speedControl disabled />
      </speed-checkbox>
    </div>

    <h3>Radio buttons</h3>
    <div class="stack">
      <speed-radio-group legend="Duration" hint="A booking lasts two hours at most.">
        <speed-radio label="30 minutes">
          <input type="radio" name="duration" value="30" speedControl />
        </speed-radio>
        <speed-radio label="1 hour" hint="The most common for a meeting.">
          <input type="radio" name="duration" value="60" speedControl checked />
        </speed-radio>
        <speed-radio label="2 hours">
          <input type="radio" name="duration" value="120" speedControl />
        </speed-radio>
        <speed-radio label="Full day (on request)">
          <input type="radio" name="duration" value="day" speedControl disabled />
        </speed-radio>
      </speed-radio-group>
      <speed-radio-group legend="Room layout" orientation="horizontal" error="Choose a layout.">
        <speed-radio label="Meeting">
          <input type="radio" name="layout" value="meeting" speedControl />
        </speed-radio>
        <speed-radio label="Conference">
          <input type="radio" name="layout" value="conference" speedControl />
        </speed-radio>
        <speed-radio label="Workshop">
          <input type="radio" name="layout" value="workshop" speedControl />
        </speed-radio>
      </speed-radio-group>
    </div>

    <h3>Switches</h3>
    <div class="stack">
      <speed-switch label="Get a confirmation by email">
        <input type="checkbox" role="switch" speedControl checked />
      </speed-switch>
      <speed-switch label="Reminder the day before" hint="Sent at 18:00.">
        <input type="checkbox" role="switch" speedControl />
      </speed-switch>
      <speed-switch label="Share with my team" error="You do not have a team yet.">
        <input type="checkbox" role="switch" speedControl />
      </speed-switch>
      <speed-switch label="Sync the calendar (managed by the administrator)">
        <input type="checkbox" role="switch" speedControl checked disabled />
      </speed-switch>
      <speed-switch label="Offline mode (coming soon)">
        <input type="checkbox" role="switch" speedControl disabled />
      </speed-switch>
    </div>

    <h2>Messages</h2>
    <div class="stack">
      <speed-message type="success">
        Booking saved: Croix-Rousse room, on 12/03/2026.
      </speed-message>
      <speed-message type="info"> Bookings open up to 30 days in advance. </speed-message>
      <speed-message type="warning">
        Room already booked at 15:00: your slot will end at 15:00.
      </speed-message>
      <speed-message type="error">
        The service is unavailable. Try again in a few minutes.
      </speed-message>
      <speed-info-banner>New: the Confluence rooms can now be booked.</speed-info-banner>
      <speed-info-banner href="#">Read the room rules.</speed-info-banner>
    </div>

    <h2>Toast</h2>
    <div class="row">
      <button speedButton type="button" (click)="toastSimple()">Simple</button>
      <button speedButton type="button" (click)="toastWithAction()">With a “Cancel” action</button>
      <button speedButton type="button" (click)="toastLong()">Long text</button>
      <button speedButton type="button" (click)="toastError()">Error</button>
    </div>
    <p class="speed-text-muted">Last toast result: {{ toastResult() }}</p>

    <h2>Screen states</h2>
    <speed-loading label="Loading bookings" />
    <speed-empty-state title="No bookings" text="You have not booked a room yet.">
      <button speedButton variant="primary" type="button">Book a room</button>
    </speed-empty-state>
    <speed-error-state
      title="Could not load"
      text="The service is unavailable. Try again in a few minutes."
      (retry)="retries.set(retries() + 1)"
    />
    <p class="speed-text-muted">Retries: {{ retries() }}</p>

    <h2>Card</h2>
    <speed-card>
      <h3 speedCardHeader>Croix-Rousse</h3>
      <p class="card-line">12/03/2026, from 14:00 to 15:00</p>
      <speed-status-badge status="confirmed" label="Confirmed" />
      <div speedCardActions>
        <button speedButton variant="secondary" type="button">Edit</button>
      </div>
    </speed-card>

    <h2>Table</h2>
    <div class="speed-table-wrapper">
      <table class="speed-table">
        <thead>
          <tr>
            <th scope="col">Room</th>
            <th scope="col">Date</th>
            <th scope="col">Status</th>
            <th scope="col"><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Croix-Rousse</td>
            <td>12/03/2026</td>
            <td><speed-status-badge status="confirmed" label="Confirmed" /></td>
            <td>
              <speed-action-menu label="Actions for Croix-Rousse on 12/03/2026">
                <button speedMenuItem [icon]="pencil">Edit</button>
                <button speedMenuItem [icon]="copy">Duplicate</button>
                <button speedMenuItem [icon]="cancel" tone="danger">Cancel the booking</button>
              </speed-action-menu>
            </td>
          </tr>
          <tr>
            <td>Fourvière</td>
            <td>14/03/2026</td>
            <td><speed-status-badge status="pending" label="Pending" /></td>
            <td>
              <speed-action-menu label="Actions for Fourvière on 14/03/2026">
                <button speedMenuItem [icon]="pencil">Edit</button>
                <button speedMenuItem [icon]="copy">Duplicate</button>
                <button speedMenuItem [icon]="cancel" tone="danger">Cancel the booking</button>
              </speed-action-menu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Header</h2>
    <p>
      The header of this demo is the <code>speed-app-header</code> component: with the sample user
      “Camille Dupont”, open their menu at the top right, or the mobile menu below 960 px, then try
      “Se déconnecter” (the library's default label, in French).
    </p>
  `,
})
export class ComponentsPage {
  protected readonly dialog = viewChild.required(SpeedConfirmDialog);
  protected readonly lastClose = signal('none');
  protected readonly rules = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly deleted = signal(false);
  protected readonly retries = signal(0);
  protected readonly toastResult = signal('none');
  private readonly toast = inject(SpeedToastService);
  protected readonly menuChoice = signal('none');
  protected readonly rooms = ['Croix-Rousse', 'Fourvière', 'Confluence'];
  protected readonly filter = signal('week');

  protected readonly tones = ['neutral', 'primary', 'accent', 'brand', 'solid', 'outline'] as const;
  protected readonly filters: SpeedFilterOption[] = [
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'past', label: 'Past' },
  ];
  protected readonly pencil = LucidePencil.icon;
  protected readonly copy = LucideCopy.icon;
  protected readonly cancel = LucideX.icon;
  protected readonly back = LucideArrowLeft.icon;
  protected readonly calendar = LucideCalendarPlus.icon;

  protected toastSimple(): void {
    this.track(this.toast.show('Booking saved.'));
  }

  protected toastWithAction(): void {
    this.track(this.toast.show('Booking of 12/03 deleted.', { action: 'Cancel' }));
  }

  protected toastLong(): void {
    this.track(
      this.toast.show(
        'Booking saved: Croix-Rousse room, on 12/03/2026 from 14:00 to 15:00. A confirmation email has been sent to you.',
      ),
    );
  }

  protected toastError(): void {
    this.track(
      this.toast.show('The booking could not be deleted.', {
        type: 'error',
        action: 'Try again',
      }),
    );
  }

  private track(ref: SpeedToastRef): void {
    this.toastResult.set('shown');
    ref.result.then((result) =>
      this.toastResult.set(result === 'action' ? '“Cancel” action' : 'closed'),
    );
  }

  protected closeWith(dialog: SpeedDialog, action: string): void {
    dialog.close();
    this.lastClose.set(action);
  }
}
