import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import {
  LucideArrowLeft,
  LucideCalendarPlus,
  LucideCopy,
  LucidePencil,
  LucideX,
} from '@lucide/angular';
import {
  SnActionMenu,
  SnBadge,
  SnButton,
  SnCard,
  SnCheckbox,
  SnConfirmDialog,
  SnControl,
  SnDialog,
  SnEmptyState,
  SnErrorState,
  SnField,
  SnFilterOption,
  SnFilterTabs,
  SnIconButton,
  SnInfoBanner,
  SnLoading,
  SnMenu,
  SnMenuItem,
  SnMenuTrigger,
  SnMessage,
  SnRadio,
  SnRadioGroup,
  SnSelect,
  SnStatusBadge,
  SnSwitch,
  SnToastRef,
  SnToastService,
  SnTooltip,
} from '@speedernet/ui';

@Component({
  selector: 'demo-components-page',
  imports: [
    SnActionMenu,
    SnBadge,
    SnButton,
    SnCard,
    SnCheckbox,
    SnConfirmDialog,
    SnControl,
    SnDialog,
    SnEmptyState,
    SnErrorState,
    SnField,
    SnFilterTabs,
    SnIconButton,
    SnInfoBanner,
    SnLoading,
    SnMenu,
    SnMenuItem,
    SnMenuTrigger,
    SnMessage,
    SnRadio,
    SnRadioGroup,
    SnSelect,
    SnStatusBadge,
    SnSwitch,
    SnTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <h1>The <span class="sn-highlight">components</span></h1>
    <p class="sn-text-muted">Every component in all its variants and states.</p>

    <h2>Buttons</h2>
    <div id="buttons" class="row">
      <button snButton variant="primary" type="button">Book a room</button>
      <button snButton variant="secondary" type="button">Cancel</button>
      <button snButton variant="danger" type="button" (click)="dialog().open()">
        Delete the booking
      </button>
      <button snButton variant="primary" type="button" disabled>Disabled</button>
      <a snButton variant="secondary" href="/components#buttons">Link as a button</a>
    </div>
    <h3>Icon buttons</h3>
    <div class="row">
      <button snIconButton label="Edit" [icon]="pencil" variant="light" type="button"></button>
      <button snIconButton label="Back" [icon]="back" variant="dark" type="button"></button>
    </div>
    @if (deleted()) {
      <sn-message type="success">Booking of 12/03 deleted.</sn-message>
    }
    <sn-confirm-dialog
      title="Delete the booking of 12/03?"
      confirmLabel="Delete"
      (confirmed)="deleted.set(true)"
    >
      Croix-Rousse room, from 14:00 to 15:00. This cannot be undone.
    </sn-confirm-dialog>

    <h2>Dialog</h2>
    <div class="row">
      <button snButton variant="secondary" type="button" (click)="formDialog.open()">
        With a form
      </button>
      <button snButton variant="secondary" type="button" (click)="longDialog.open()">
        Long content
      </button>
      <button snButton variant="secondary" type="button" (click)="infoDialog.open()">
        No actions
      </button>
      <button snButton variant="danger" type="button" (click)="dialog().open()">
        Confirmation
      </button>
    </div>
    <p class="sn-text-muted">Last closed with: {{ lastClose() }}</p>
    <sn-dialog #formDialog title="Edit the booking" (dismissed)="lastClose.set('Escape')">
      <div class="stack">
        <sn-field label="Date" hint="Expected format: dd/mm/yyyy.">
          <input snControl type="text" value="12/03/2026" />
        </sn-field>
        <sn-field label="Comment">
          <textarea snControl rows="3"></textarea>
        </sn-field>
      </div>
      <button snDialogActions snButton type="button" (click)="closeWith(formDialog, 'Cancel')">
        Cancel
      </button>
      <button
        snDialogActions
        snButton
        variant="primary"
        type="button"
        (click)="closeWith(formDialog, 'Save')"
      >
        Save
      </button>
    </sn-dialog>
    <sn-dialog #longDialog title="Room rules" (dismissed)="lastClose.set('Escape')">
      @for (n of rules; track n) {
        <p>
          Article {{ n }}. Rooms can be booked up to 30 days in advance, for a slot of four hours at
          most. Leave the room on time and leave it tidy.
        </p>
      }
      <button
        snDialogActions
        snButton
        variant="primary"
        type="button"
        (click)="closeWith(longDialog, 'Got it')"
      >
        Got it
      </button>
    </sn-dialog>
    <sn-dialog #infoDialog title="Confluence room" (dismissed)="lastClose.set('Escape')">
      <p>Projector, whiteboard, 12 seats. Close with Escape.</p>
    </sn-dialog>
    <h2>Action menu</h2>
    <div class="row">
      <sn-action-menu label="Actions for the booking of 12/03">
        <button snMenuItem [icon]="pencil" (click)="menuChoice.set('Edit')">Edit</button>
        <button snMenuItem [icon]="copy" (click)="menuChoice.set('Duplicate')">Duplicate</button>
        <button snMenuItem [icon]="cancel" tone="danger" (click)="menuChoice.set('Cancel')">
          Cancel the booking
        </button>
      </sn-action-menu>
      <sn-action-menu label="Actions for the booking of 02/02 (past)">
        <button snMenuItem (click)="menuChoice.set('Duplicate')">Duplicate</button>
        <button snMenuItem disabled>Edit</button>
        <button snMenuItem tone="danger" disabled>Cancel the booking</button>
      </sn-action-menu>
    </div>
    <h3>Menu on another button</h3>
    <p class="sn-text-muted">
      <code>snMenuTrigger</code> opens an <code>sn-menu</code> from any button, like the user menu
      in the header.
    </p>
    <div class="row">
      <button snButton type="button" [snMenuTrigger]="exportMenu">Export</button>
      <sn-menu #exportMenu>
        <button snMenuItem (click)="menuChoice.set('Export as PDF')">As PDF</button>
        <button snMenuItem (click)="menuChoice.set('Export as spreadsheet')">As spreadsheet</button>
      </sn-menu>
    </div>
    <p class="sn-text-muted">
      With icons and a dangerous action, without icons with disabled actions, then on a regular
      button. Last choice: {{ menuChoice() }}
    </p>

    <h2>Badges</h2>
    <div class="row">
      @for (tone of tones; track tone) {
        <sn-badge [tone]="tone">{{ tone }}</sn-badge>
      }
      <sn-badge tone="primary" [icon]="calendar">With icon</sn-badge>
    </div>
    <h3>Statuses</h3>
    <div class="row">
      <sn-status-badge status="confirmed" label="Confirmed" />
      <sn-status-badge status="pending" label="Pending" />
      <sn-status-badge status="cancelled" label="Cancelled" />
      <sn-status-badge status="archived" label="Archived" />
    </div>

    <h2>Tooltip</h2>
    <div class="row">
      <sn-tooltip text="Edit the booking">
        <button snIconButton label="Edit" [icon]="pencil" variant="light" type="button"></button>
      </sn-tooltip>
      <sn-tooltip text="Back to the list">
        <button snButton variant="secondary" type="button">Back</button>
      </sn-tooltip>
    </div>

    <h2>Filters</h2>
    <sn-filter-tabs label="Booking period" [options]="filters" [(value)]="filter" />
    <p class="sn-text-muted">Selected filter: {{ filter() }}</p>

    <h2>Fields</h2>
    <div class="stack">
      <sn-field label="Date" hint="Expected format: dd/mm/yyyy.">
        <input snControl type="text" value="12/03/2026" />
      </sn-field>
      <sn-field label="End date" error="This date does not exist. Expected format: dd/mm/yyyy.">
        <input snControl type="text" value="31/02/2026" />
      </sn-field>
      <sn-field label="Comment">
        <textarea snControl rows="3"></textarea>
      </sn-field>
      <sn-field label="Disabled field">
        <input snControl type="text" value="Read-only" disabled />
      </sn-field>
    </div>

    <h3>Select</h3>
    <div class="stack">
      <sn-field label="Room">
        <sn-select>
          <select snControl>
            <option value="" disabled selected>Choose a room</option>
            @for (room of rooms; track room) {
              <option>{{ room }}</option>
            }
          </select>
        </sn-select>
      </sn-field>
      <sn-field label="Time slot" hint="Slots last one hour.">
        <sn-select>
          <select snControl>
            <option>09:00 - 10:00</option>
            <option selected>14:00 - 15:00</option>
            <option>16:00 - 17:00</option>
          </select>
        </sn-select>
      </sn-field>
      <sn-field label="Fallback room" error="Choose a fallback room.">
        <sn-select>
          <select snControl>
            <option value="" disabled selected>Choose a room</option>
            @for (room of rooms; track room) {
              <option>{{ room }}</option>
            }
          </select>
        </sn-select>
      </sn-field>
      <sn-field label="Floor" hint="Set by the chosen room.">
        <sn-select>
          <select snControl disabled>
            <option>3rd floor</option>
          </select>
        </sn-select>
      </sn-field>
    </div>

    <h3>Checkboxes</h3>
    <div class="stack">
      <sn-checkbox label="Add a video projector">
        <input type="checkbox" snControl />
      </sn-checkbox>
      <sn-checkbox label="Recurring booking" hint="Every week, on the same day.">
        <input type="checkbox" snControl checked />
      </sn-checkbox>
      <sn-checkbox label="I accept the room rules" error="Accept the rules to book.">
        <input type="checkbox" snControl />
      </sn-checkbox>
      <sn-checkbox label="Wheelchair access (all rooms)">
        <input type="checkbox" snControl checked disabled />
      </sn-checkbox>
      <sn-checkbox label="Catering (unavailable)">
        <input type="checkbox" snControl disabled />
      </sn-checkbox>
    </div>

    <h3>Radio buttons</h3>
    <div class="stack">
      <sn-radio-group legend="Duration" hint="A booking lasts two hours at most.">
        <sn-radio label="30 minutes">
          <input type="radio" name="duration" value="30" snControl />
        </sn-radio>
        <sn-radio label="1 hour" hint="The most common for a meeting.">
          <input type="radio" name="duration" value="60" snControl checked />
        </sn-radio>
        <sn-radio label="2 hours">
          <input type="radio" name="duration" value="120" snControl />
        </sn-radio>
        <sn-radio label="Full day (on request)">
          <input type="radio" name="duration" value="day" snControl disabled />
        </sn-radio>
      </sn-radio-group>
      <sn-radio-group legend="Room layout" orientation="horizontal" error="Choose a layout.">
        <sn-radio label="Meeting">
          <input type="radio" name="layout" value="meeting" snControl />
        </sn-radio>
        <sn-radio label="Conference">
          <input type="radio" name="layout" value="conference" snControl />
        </sn-radio>
        <sn-radio label="Workshop">
          <input type="radio" name="layout" value="workshop" snControl />
        </sn-radio>
      </sn-radio-group>
    </div>

    <h3>Switches</h3>
    <div class="stack">
      <sn-switch label="Get a confirmation by email">
        <input type="checkbox" role="switch" snControl checked />
      </sn-switch>
      <sn-switch label="Reminder the day before" hint="Sent at 18:00.">
        <input type="checkbox" role="switch" snControl />
      </sn-switch>
      <sn-switch label="Share with my team" error="You do not have a team yet.">
        <input type="checkbox" role="switch" snControl />
      </sn-switch>
      <sn-switch label="Sync the calendar (managed by the administrator)">
        <input type="checkbox" role="switch" snControl checked disabled />
      </sn-switch>
      <sn-switch label="Offline mode (coming soon)">
        <input type="checkbox" role="switch" snControl disabled />
      </sn-switch>
    </div>

    <h2>Messages</h2>
    <div class="stack">
      <sn-message type="success"> Booking saved: Croix-Rousse room, on 12/03/2026. </sn-message>
      <sn-message type="info"> Bookings open up to 30 days in advance. </sn-message>
      <sn-message type="warning">
        Room already booked at 15:00: your slot will end at 15:00.
      </sn-message>
      <sn-message type="error">
        The service is unavailable. Try again in a few minutes.
      </sn-message>
      <sn-info-banner>New: the Confluence rooms can now be booked.</sn-info-banner>
      <sn-info-banner href="#">Read the room rules.</sn-info-banner>
    </div>

    <h2>Toast</h2>
    <div class="row">
      <button snButton type="button" (click)="toastSimple()">Simple</button>
      <button snButton type="button" (click)="toastWithAction()">With a “Cancel” action</button>
      <button snButton type="button" (click)="toastLong()">Long text</button>
      <button snButton type="button" (click)="toastError()">Error</button>
    </div>
    <p class="sn-text-muted">Last toast result: {{ toastResult() }}</p>

    <h2>Screen states</h2>
    <sn-loading label="Loading bookings" />
    <sn-empty-state title="No bookings" text="You have not booked a room yet.">
      <button snButton variant="primary" type="button">Book a room</button>
    </sn-empty-state>
    <sn-error-state
      title="Could not load"
      text="The service is unavailable. Try again in a few minutes."
      (retry)="retries.set(retries() + 1)"
    />
    <p class="sn-text-muted">Retries: {{ retries() }}</p>

    <h2>Card</h2>
    <sn-card>
      <h3 snCardHeader>Croix-Rousse</h3>
      <p class="card-line">12/03/2026, from 14:00 to 15:00</p>
      <sn-status-badge status="confirmed" label="Confirmed" />
      <div snCardActions>
        <button snButton variant="secondary" type="button">Edit</button>
      </div>
    </sn-card>

    <h2>Table</h2>
    <div class="sn-table-wrapper">
      <table class="sn-table">
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
            <td><sn-status-badge status="confirmed" label="Confirmed" /></td>
            <td>
              <sn-action-menu label="Actions for Croix-Rousse on 12/03/2026">
                <button snMenuItem [icon]="pencil">Edit</button>
                <button snMenuItem [icon]="copy">Duplicate</button>
                <button snMenuItem [icon]="cancel" tone="danger">Cancel the booking</button>
              </sn-action-menu>
            </td>
          </tr>
          <tr>
            <td>Fourvière</td>
            <td>14/03/2026</td>
            <td><sn-status-badge status="pending" label="Pending" /></td>
            <td>
              <sn-action-menu label="Actions for Fourvière on 14/03/2026">
                <button snMenuItem [icon]="pencil">Edit</button>
                <button snMenuItem [icon]="copy">Duplicate</button>
                <button snMenuItem [icon]="cancel" tone="danger">Cancel the booking</button>
              </sn-action-menu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Header</h2>
    <p>
      The header of this demo is the <code>sn-app-header</code> component: with the sample user
      “Camille Dupont”, open their menu at the top right, or the mobile menu below 960 px, then try
      “Se déconnecter” (the library's default label, in French).
    </p>
  `,
})
export class ComponentsPage {
  protected readonly dialog = viewChild.required(SnConfirmDialog);
  protected readonly lastClose = signal('none');
  protected readonly rules = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly deleted = signal(false);
  protected readonly retries = signal(0);
  protected readonly toastResult = signal('none');
  private readonly toast = inject(SnToastService);
  protected readonly menuChoice = signal('none');
  protected readonly rooms = ['Croix-Rousse', 'Fourvière', 'Confluence'];
  protected readonly filter = signal('week');

  protected readonly tones = ['neutral', 'primary', 'accent', 'brand', 'solid', 'outline'] as const;
  protected readonly filters: SnFilterOption[] = [
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

  private track(ref: SnToastRef): void {
    this.toastResult.set('shown');
    ref.result.then((result) =>
      this.toastResult.set(result === 'action' ? '“Cancel” action' : 'closed'),
    );
  }

  protected closeWith(dialog: SnDialog, action: string): void {
    dialog.close();
    this.lastClose.set(action);
  }
}
