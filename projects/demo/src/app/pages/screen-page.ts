import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCopy, LucidePencil, LucideX } from '@lucide/angular';
import {
  SnActionMenu,
  SnButton,
  SnCard,
  SnControl,
  SnDialog,
  SnField,
  SnFilterOption,
  SnFilterTabs,
  SnMenuItem,
  SnMessage,
  SnSelect,
  SnStatus,
  SnStatusBadge,
  SnToastService,
} from '@speedernet/ui';

interface Booking {
  id: number;
  room: string;
  date: string;
  slot: string;
  status: SnStatus;
  statusLabel: string;
  period: 'week' | 'month' | 'past';
}

const BOOKINGS: Booking[] = [
  {
    id: 1,
    room: 'Croix-Rousse',
    date: '12/03/2026',
    slot: '14:00 - 15:00',
    status: 'confirmed',
    statusLabel: 'Confirmed',
    period: 'week',
  },
  {
    id: 2,
    room: 'Fourvière',
    date: '14/03/2026',
    slot: '09:00 - 10:30',
    status: 'pending',
    statusLabel: 'Pending',
    period: 'week',
  },
  {
    id: 3,
    room: 'Confluence',
    date: '27/03/2026',
    slot: '16:00 - 17:00',
    status: 'confirmed',
    statusLabel: 'Confirmed',
    period: 'month',
  },
  {
    id: 4,
    room: 'Croix-Rousse',
    date: '02/02/2026',
    slot: '11:00 - 12:00',
    status: 'archived',
    statusLabel: 'Archived',
    period: 'past',
  },
  {
    id: 5,
    room: 'Fourvière',
    date: '20/01/2026',
    slot: '10:00 - 11:00',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    period: 'past',
  },
];

const ROOMS = ['Croix-Rousse', 'Fourvière', 'Confluence'];
const SLOTS = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '16:00 - 17:00'];

/** "2026-03-12" (date input) to "12/03/2026" (displayed), and back. */
function toDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function toIsoDate(display: string): string {
  const [day, month, year] = display.split('/');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'demo-screen-page',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    SnActionMenu,
    SnButton,
    SnCard,
    SnControl,
    SnDialog,
    SnField,
    SnFilterTabs,
    SnMenuItem,
    SnMessage,
    SnSelect,
    SnStatusBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <div class="page-head">
      <h1>My <span class="sn-highlight">bookings</span></h1>
      <button snButton variant="primary" type="button" (click)="openNew()">Book a room</button>
    </div>
    <sn-message type="info"> Bookings open up to 30 days in advance. </sn-message>

    <sn-filter-tabs label="Booking period" [options]="filters" [(value)]="filter" />

    <h2 class="visually-hidden">Booking list</h2>

    <ul class="card-list">
      @for (b of visible(); track b.id) {
        <li>
          <sn-card>
            <div snCardHeader class="booking-head">
              <h3>{{ b.room }}</h3>
              <ng-container *ngTemplateOutlet="actions; context: { $implicit: b }" />
            </div>
            <p class="card-line">{{ b.date }}, {{ b.slot }}</p>
            <sn-status-badge [status]="b.status" [label]="b.statusLabel" />
          </sn-card>
        </li>
      }
    </ul>

    <div class="table-view sn-table-wrapper">
      <table class="sn-table">
        <caption class="visually-hidden">
          My bookings
        </caption>
        <thead>
          <tr>
            <th scope="col">Room</th>
            <th scope="col">Date</th>
            <th scope="col">Time slot</th>
            <th scope="col">Status</th>
            <th scope="col"><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          @for (b of visible(); track b.id) {
            <tr>
              <td>{{ b.room }}</td>
              <td>{{ b.date }}</td>
              <td>{{ b.slot }}</td>
              <td><sn-status-badge [status]="b.status" [label]="b.statusLabel" /></td>
              <td class="actions-cell">
                <ng-container *ngTemplateOutlet="actions; context: { $implicit: b }" />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <ng-template #actions let-b>
      <sn-action-menu [label]="'Actions for ' + b.room + ' on ' + b.date">
        <button snMenuItem [icon]="pencil" [disabled]="!isActive(b)" (click)="openEdit(b)">
          Edit
        </button>
        <button snMenuItem [icon]="copy" (click)="duplicate(b)">Duplicate</button>
        <button
          snMenuItem
          [icon]="cancelIcon"
          tone="danger"
          [disabled]="!isActive(b)"
          (click)="cancel(b)"
        >
          Cancel the booking
        </button>
      </sn-action-menu>
    </ng-template>

    <sn-dialog
      [title]="editing() ? 'Edit the booking' : 'Book a room'"
      (closed)="submitted.set(false)"
    >
      <form id="booking-form" class="stack booking-form" [formGroup]="form" (ngSubmit)="save()">
        <sn-field label="Room" [error]="errorFor('room', 'Choose a room.')">
          <sn-select>
            <select snControl formControlName="room">
              <option value="" disabled>Choose a room</option>
              @for (room of rooms; track room) {
                <option [value]="room">{{ room }}</option>
              }
            </select>
          </sn-select>
        </sn-field>
        <sn-field
          label="Date"
          hint="Up to 30 days in advance."
          [error]="errorFor('date', 'Choose a date.')"
        >
          <input snControl type="date" formControlName="date" />
        </sn-field>
        <sn-field label="Time slot" [error]="errorFor('slot', 'Choose a time slot.')">
          <sn-select>
            <select snControl formControlName="slot">
              <option value="" disabled>Choose a time slot</option>
              @for (slot of slots; track slot) {
                <option [value]="slot">{{ slot }}</option>
              }
            </select>
          </sn-select>
        </sn-field>
      </form>
      <button snDialogActions snButton type="button" (click)="dialog().close()">Cancel</button>
      <button snDialogActions snButton variant="primary" type="submit" form="booking-form">
        {{ editing() ? 'Save' : 'Book' }}
      </button>
    </sn-dialog>
  `,
})
export class ScreenPage {
  private readonly toast = inject(SnToastService);
  private readonly injector = inject(Injector);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly dialog = viewChild.required(SnDialog);

  protected readonly filter = signal('week');
  protected readonly filters: SnFilterOption[] = [
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'past', label: 'Past' },
  ];
  protected readonly bookings = signal<Booking[]>(BOOKINGS);
  protected readonly visible = computed(() =>
    this.bookings().filter((b) => b.period === this.filter()),
  );

  protected readonly rooms = ROOMS;
  protected readonly slots = SLOTS;
  protected readonly pencil = LucidePencil.icon;
  protected readonly copy = LucideCopy.icon;
  protected readonly cancelIcon = LucideX.icon;

  protected readonly form = new FormGroup({
    room: new FormControl('', { nonNullable: true, validators: Validators.required }),
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    slot: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  protected readonly editing = signal<Booking | null>(null);
  // Errors show only once the user has tried to submit.
  protected readonly submitted = signal(false);
  private nextId = BOOKINGS.length + 1;

  protected isActive(b: Booking): boolean {
    return b.status === 'confirmed' || b.status === 'pending';
  }

  protected errorFor(name: 'room' | 'date' | 'slot', message: string): string | null {
    return this.submitted() && this.form.controls[name].invalid ? message : null;
  }

  protected openNew(): void {
    this.editing.set(null);
    this.form.reset();
    this.dialog().open();
  }

  protected openEdit(b: Booking): void {
    this.editing.set(b);
    this.form.reset({ room: b.room, date: toIsoDate(b.date), slot: b.slot });
    this.dialog().open();
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      // Once the errors are shown, take the user to the first one.
      afterNextRender(
        () => this.host.querySelector<HTMLElement>('sn-dialog [aria-invalid="true"]')?.focus(),
        { injector: this.injector },
      );
      return;
    }
    const { room, date, slot } = this.form.getRawValue();
    const edited = this.editing();
    const values = { room, date: toDisplayDate(date), slot };
    if (edited) {
      this.bookings.update((list) => list.map((b) => (b === edited ? { ...b, ...values } : b)));
    } else {
      // Demo data: a new booking is pending and listed this week.
      this.add({ ...values, status: 'pending', statusLabel: 'Pending', period: 'week' });
      this.filter.set('week');
    }
    this.dialog().close();
    this.toast.show(
      edited
        ? `Booking updated: ${room}, on ${values.date}.`
        : `Booking saved: ${room}, on ${values.date}.`,
    );
  }

  protected duplicate(b: Booking): void {
    this.add({ ...b, status: 'pending', statusLabel: 'Pending', period: 'week' });
    this.filter.set('week');
    this.toast.show(`Booking duplicated: ${b.room}, on ${b.date}.`);
  }

  protected cancel(b: Booking): void {
    const cancelled: Booking = { ...b, status: 'cancelled', statusLabel: 'Cancelled' };
    this.replace(b, cancelled);
    this.toast
      .show(`Booking of ${b.date} cancelled.`, { action: 'Restore' })
      .result.then((result) => {
        if (result === 'action') {
          this.replace(cancelled, b);
          this.toast.show(`Booking of ${b.date} restored.`);
        }
      });
  }

  private add(values: Omit<Booking, 'id'>): void {
    this.bookings.update((list) => [{ ...values, id: this.nextId++ }, ...list]);
  }

  private replace(from: Booking, to: Booking): void {
    this.bookings.update((list) => list.map((b) => (b === from ? to : b)));
  }
}
