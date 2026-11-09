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
  SpeedActionMenu,
  SpeedButton,
  SpeedCard,
  SpeedControl,
  SpeedDialog,
  SpeedField,
  SpeedFilterOption,
  SpeedFilterTabs,
  SpeedMenuItem,
  SpeedMessage,
  SpeedSelect,
  SpeedStatus,
  SpeedStatusBadge,
  SpeedToastService,
} from '@speedernet/ui';

interface Booking {
  id: number;
  room: string;
  date: string;
  slot: string;
  status: SpeedStatus;
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
    statusLabel: 'Confirmée',
    period: 'week',
  },
  {
    id: 2,
    room: 'Fourvière',
    date: '14/03/2026',
    slot: '09:00 - 10:30',
    status: 'pending',
    statusLabel: 'En attente',
    period: 'week',
  },
  {
    id: 3,
    room: 'Confluence',
    date: '27/03/2026',
    slot: '16:00 - 17:00',
    status: 'confirmed',
    statusLabel: 'Confirmée',
    period: 'month',
  },
  {
    id: 4,
    room: 'Croix-Rousse',
    date: '02/02/2026',
    slot: '11:00 - 12:00',
    status: 'archived',
    statusLabel: 'Archivée',
    period: 'past',
  },
  {
    id: 5,
    room: 'Fourvière',
    date: '20/01/2026',
    slot: '10:00 - 11:00',
    status: 'cancelled',
    statusLabel: 'Annulée',
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
    SpeedActionMenu,
    SpeedButton,
    SpeedCard,
    SpeedControl,
    SpeedDialog,
    SpeedField,
    SpeedFilterTabs,
    SpeedMenuItem,
    SpeedMessage,
    SpeedSelect,
    SpeedStatusBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <div class="page-head">
      <h1>Mes <span class="speed-highlight">réservations</span></h1>
      <button speedButton variant="primary" type="button" (click)="openNew()">
        Réserver une salle
      </button>
    </div>
    <speed-message type="info">
      Les réservations sont ouvertes jusqu'à 30 jours à l'avance.
    </speed-message>

    <speed-filter-tabs label="Période des réservations" [options]="filters" [(value)]="filter" />

    <h2 class="visually-hidden">Liste des réservations</h2>

    <ul class="card-list">
      @for (b of visible(); track b.id) {
        <li>
          <speed-card>
            <div speedCardHeader class="booking-head">
              <h3>{{ b.room }}</h3>
              <ng-container *ngTemplateOutlet="actions; context: { $implicit: b }" />
            </div>
            <p class="card-line">{{ b.date }}, {{ b.slot }}</p>
            <speed-status-badge [status]="b.status" [label]="b.statusLabel" />
          </speed-card>
        </li>
      }
    </ul>

    <div class="table-view speed-table-wrapper">
      <table class="speed-table">
        <caption class="visually-hidden">
          Mes réservations
        </caption>
        <thead>
          <tr>
            <th scope="col">Salle</th>
            <th scope="col">Date</th>
            <th scope="col">Créneau</th>
            <th scope="col">Statut</th>
            <th scope="col"><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          @for (b of visible(); track b.id) {
            <tr>
              <td>{{ b.room }}</td>
              <td>{{ b.date }}</td>
              <td>{{ b.slot }}</td>
              <td><speed-status-badge [status]="b.status" [label]="b.statusLabel" /></td>
              <td class="actions-cell">
                <ng-container *ngTemplateOutlet="actions; context: { $implicit: b }" />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <ng-template #actions let-b>
      <speed-action-menu [label]="'Actions pour ' + b.room + ' le ' + b.date">
        <button speedMenuItem [icon]="pencil" [disabled]="!isActive(b)" (click)="openEdit(b)">
          Modifier
        </button>
        <button speedMenuItem [icon]="copy" (click)="duplicate(b)">Dupliquer</button>
        <button
          speedMenuItem
          [icon]="cancelIcon"
          tone="danger"
          [disabled]="!isActive(b)"
          (click)="cancel(b)"
        >
          Annuler la réservation
        </button>
      </speed-action-menu>
    </ng-template>

    <speed-dialog
      [title]="editing() ? 'Modifier la réservation' : 'Réserver une salle'"
      (closed)="submitted.set(false)"
    >
      <form id="booking-form" class="stack booking-form" [formGroup]="form" (ngSubmit)="save()">
        <speed-select label="Salle" [error]="errorFor('room', 'Choisissez une salle.')">
          <select speedControl formControlName="room">
            <option value="" disabled>Choisir une salle</option>
            @for (room of rooms; track room) {
              <option [value]="room">{{ room }}</option>
            }
          </select>
        </speed-select>
        <speed-field
          label="Date"
          hint="Jusqu'à 30 jours à l'avance."
          [error]="errorFor('date', 'Choisissez une date.')"
        >
          <input speedControl type="date" formControlName="date" />
        </speed-field>
        <speed-select label="Créneau" [error]="errorFor('slot', 'Choisissez un créneau.')">
          <select speedControl formControlName="slot">
            <option value="" disabled>Choisir un créneau</option>
            @for (slot of slots; track slot) {
              <option [value]="slot">{{ slot }}</option>
            }
          </select>
        </speed-select>
      </form>
      <button speedDialogActions speedButton type="button" (click)="dialog().close()">
        Annuler
      </button>
      <button speedDialogActions speedButton variant="primary" type="submit" form="booking-form">
        {{ editing() ? 'Enregistrer' : 'Réserver' }}
      </button>
    </speed-dialog>
  `,
})
export class ScreenPage {
  private readonly toast = inject(SpeedToastService);
  private readonly injector = inject(Injector);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly dialog = viewChild.required(SpeedDialog);

  protected readonly filter = signal('week');
  protected readonly filters: SpeedFilterOption[] = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'past', label: 'Passées' },
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
        () => this.host.querySelector<HTMLElement>('speed-dialog [aria-invalid="true"]')?.focus(),
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
      this.add({ ...values, status: 'pending', statusLabel: 'En attente', period: 'week' });
      this.filter.set('week');
    }
    this.dialog().close();
    this.toast.show(
      edited
        ? `Réservation modifiée : ${room}, le ${values.date}.`
        : `Réservation enregistrée : ${room}, le ${values.date}.`,
    );
  }

  protected duplicate(b: Booking): void {
    this.add({ ...b, status: 'pending', statusLabel: 'En attente', period: 'week' });
    this.filter.set('week');
    this.toast.show(`Réservation dupliquée : ${b.room}, le ${b.date}.`);
  }

  protected cancel(b: Booking): void {
    const cancelled: Booking = { ...b, status: 'cancelled', statusLabel: 'Annulée' };
    this.replace(b, cancelled);
    this.toast
      .show(`Réservation du ${b.date} annulée.`, { action: 'Rétablir' })
      .result.then((result) => {
        if (result === 'action') {
          this.replace(cancelled, b);
          this.toast.show(`Réservation du ${b.date} rétablie.`);
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
