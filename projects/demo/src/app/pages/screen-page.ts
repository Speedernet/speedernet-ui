import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  SnButton,
  SnCard,
  SnFilterOption,
  SnFilterTabs,
  SnMessage,
  SnStatusBadge,
  SnStatus,
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

@Component({
  selector: 'demo-screen-page',
  imports: [SnButton, SnCard, SnFilterTabs, SnMessage, SnStatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <div class="page-head">
      <h1>Mes <span class="sn-highlight">réservations</span></h1>
      <button snButton variant="primary" type="button">Réserver une salle</button>
    </div>
    <sn-message type="info">
      Les réservations sont ouvertes jusqu'à 30 jours à l'avance.
    </sn-message>

    <sn-filter-tabs label="Période des réservations" [options]="filters" [(value)]="filter" />

    <ul class="card-list">
      @for (b of visible(); track b.id) {
        <li>
          <sn-card>
            <h3 snCardHeader>{{ b.room }}</h3>
            <p class="card-line">{{ b.date }}, {{ b.slot }}</p>
            <sn-status-badge [status]="b.status" [label]="b.statusLabel" />
          </sn-card>
        </li>
      }
    </ul>

    <div class="table-view sn-table-wrapper">
      <table class="sn-table">
        <thead>
          <tr>
            <th scope="col">Salle</th>
            <th scope="col">Date</th>
            <th scope="col">Créneau</th>
            <th scope="col">Statut</th>
          </tr>
        </thead>
        <tbody>
          @for (b of visible(); track b.id) {
            <tr>
              <td>{{ b.room }}</td>
              <td>{{ b.date }}</td>
              <td>{{ b.slot }}</td>
              <td><sn-status-badge [status]="b.status" [label]="b.statusLabel" /></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ScreenPage {
  protected readonly filter = signal('week');
  protected readonly filters: SnFilterOption[] = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'past', label: 'Passées' },
  ];
  protected readonly visible = computed(() => BOOKINGS.filter((b) => b.period === this.filter()));
}
