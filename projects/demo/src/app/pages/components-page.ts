import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { LucideArrowLeft, LucideCalendarPlus, LucidePencil } from '@lucide/angular';
import {
  SnBadge,
  SnButton,
  SnCard,
  SnCheckbox,
  SnConfirmDialog,
  SnControl,
  SnEmptyState,
  SnErrorState,
  SnField,
  SnFilterOption,
  SnFilterTabs,
  SnIconButton,
  SnInfoBanner,
  SnLoading,
  SnMessage,
  SnRadio,
  SnRadioGroup,
  SnStatusBadge,
  SnSwitch,
  SnTooltip,
} from '@speedernet/ui';

@Component({
  selector: 'demo-components-page',
  imports: [
    SnBadge,
    SnButton,
    SnCard,
    SnCheckbox,
    SnConfirmDialog,
    SnControl,
    SnEmptyState,
    SnErrorState,
    SnField,
    SnFilterTabs,
    SnIconButton,
    SnInfoBanner,
    SnLoading,
    SnMessage,
    SnRadio,
    SnRadioGroup,
    SnStatusBadge,
    SnSwitch,
    SnTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <h1>Les <span class="sn-highlight">composants</span></h1>
    <p class="sn-text-muted">Chaque composant dans toutes ses variantes et ses états.</p>

    <h2>Boutons</h2>
    <div id="buttons" class="row">
      <button snButton variant="primary" type="button">Réserver une salle</button>
      <button snButton variant="secondary" type="button">Annuler</button>
      <button snButton variant="danger" type="button" (click)="dialog().open()">
        Supprimer la réservation
      </button>
      <button snButton variant="primary" type="button" disabled>Désactivé</button>
      <a snButton variant="secondary" href="/composants#buttons">Lien en bouton</a>
    </div>
    <h3>Boutons-icônes</h3>
    <div class="row">
      <button snIconButton label="Modifier" [icon]="pencil" variant="light" type="button"></button>
      <button snIconButton label="Retour" [icon]="back" variant="dark" type="button"></button>
    </div>
    @if (deleted()) {
      <sn-message type="success">Réservation du 12/03 supprimée.</sn-message>
    }
    <sn-confirm-dialog
      title="Supprimer la réservation du 12/03 ?"
      confirmLabel="Supprimer"
      (confirmed)="deleted.set(true)"
    >
      Salle Croix-Rousse, de 14:00 à 15:00. Cette action est définitive.
    </sn-confirm-dialog>

    <h2>Badges</h2>
    <div class="row">
      @for (tone of tones; track tone) {
        <sn-badge [tone]="tone">{{ tone }}</sn-badge>
      }
      <sn-badge tone="primary" [icon]="calendar">Avec icône</sn-badge>
    </div>
    <h3>Statuts</h3>
    <div class="row">
      <sn-status-badge status="confirmed" label="Confirmée" />
      <sn-status-badge status="pending" label="En attente" />
      <sn-status-badge status="cancelled" label="Annulée" />
      <sn-status-badge status="archived" label="Archivée" />
    </div>

    <h2>Infobulle</h2>
    <div class="row">
      <sn-tooltip text="Modifier la réservation">
        <button
          snIconButton
          label="Modifier"
          [icon]="pencil"
          variant="light"
          type="button"
        ></button>
      </sn-tooltip>
      <sn-tooltip text="Revenir à la liste">
        <button snButton variant="secondary" type="button">Retour</button>
      </sn-tooltip>
    </div>

    <h2>Filtres</h2>
    <sn-filter-tabs label="Période des réservations" [options]="filters" [(value)]="filter" />
    <p class="sn-text-muted">Filtre sélectionné : {{ filter() }}</p>

    <h2>Champs</h2>
    <div class="stack">
      <sn-field label="Date" hint="Format attendu : jj/mm/aaaa.">
        <input snControl type="text" value="12/03/2026" />
      </sn-field>
      <sn-field label="Date de fin" error="Cette date n'existe pas. Format attendu : jj/mm/aaaa.">
        <input snControl type="text" value="31/02/2026" />
      </sn-field>
      <sn-field label="Salle">
        <select snControl>
          <option>Croix-Rousse</option>
          <option>Fourvière</option>
          <option>Confluence</option>
        </select>
      </sn-field>
      <sn-field label="Commentaire">
        <textarea snControl rows="3"></textarea>
      </sn-field>
      <sn-field label="Champ désactivé">
        <input snControl type="text" value="Non modifiable" disabled />
      </sn-field>
    </div>

    <h3>Cases à cocher</h3>
    <div class="stack">
      <sn-checkbox label="Ajouter un vidéoprojecteur">
        <input type="checkbox" snControl />
      </sn-checkbox>
      <sn-checkbox label="Réservation récurrente" hint="Chaque semaine, le même jour.">
        <input type="checkbox" snControl checked />
      </sn-checkbox>
      <sn-checkbox
        label="J'accepte le règlement des salles"
        error="Acceptez le règlement pour réserver."
      >
        <input type="checkbox" snControl />
      </sn-checkbox>
      <sn-checkbox label="Accès handicapé (toutes les salles)">
        <input type="checkbox" snControl checked disabled />
      </sn-checkbox>
      <sn-checkbox label="Traiteur (indisponible)">
        <input type="checkbox" snControl disabled />
      </sn-checkbox>
    </div>

    <h3>Boutons radio</h3>
    <div class="stack">
      <sn-radio-group legend="Durée" hint="Une réservation dure au plus deux heures.">
        <sn-radio label="30 minutes">
          <input type="radio" name="duration" value="30" snControl />
        </sn-radio>
        <sn-radio label="1 heure" hint="Le plus fréquent pour une réunion.">
          <input type="radio" name="duration" value="60" snControl checked />
        </sn-radio>
        <sn-radio label="2 heures">
          <input type="radio" name="duration" value="120" snControl />
        </sn-radio>
        <sn-radio label="Journée entière (sur demande)">
          <input type="radio" name="duration" value="day" snControl disabled />
        </sn-radio>
      </sn-radio-group>
      <sn-radio-group
        legend="Disposition de la salle"
        orientation="horizontal"
        error="Choisissez une disposition."
      >
        <sn-radio label="Réunion">
          <input type="radio" name="layout" value="meeting" snControl />
        </sn-radio>
        <sn-radio label="Conférence">
          <input type="radio" name="layout" value="conference" snControl />
        </sn-radio>
        <sn-radio label="Atelier">
          <input type="radio" name="layout" value="workshop" snControl />
        </sn-radio>
      </sn-radio-group>
    </div>

    <h3>Interrupteurs</h3>
    <div class="stack">
      <sn-switch label="Recevoir une confirmation par courriel">
        <input type="checkbox" role="switch" snControl checked />
      </sn-switch>
      <sn-switch label="Rappel la veille" hint="Envoyé à 18:00.">
        <input type="checkbox" role="switch" snControl />
      </sn-switch>
      <sn-switch label="Partager avec mon équipe" error="Vous n'avez pas encore d'équipe.">
        <input type="checkbox" role="switch" snControl />
      </sn-switch>
      <sn-switch label="Synchroniser l'agenda (géré par l'administrateur)">
        <input type="checkbox" role="switch" snControl checked disabled />
      </sn-switch>
      <sn-switch label="Mode hors ligne (bientôt)">
        <input type="checkbox" role="switch" snControl disabled />
      </sn-switch>
    </div>

    <h2>Messages</h2>
    <div class="stack">
      <sn-message type="success">
        Réservation enregistrée : salle Croix-Rousse, le 12/03/2026.
      </sn-message>
      <sn-message type="info">
        Les réservations sont ouvertes jusqu'à 30 jours à l'avance.
      </sn-message>
      <sn-message type="warning">
        Salle déjà réservée à 15:00 : votre créneau s'arrêtera à 15:00.
      </sn-message>
      <sn-message type="error">
        Le service est indisponible. Réessayez dans quelques minutes.
      </sn-message>
      <sn-info-banner>Nouveau : les salles Confluence sont réservables.</sn-info-banner>
      <sn-info-banner href="#">Consulter le règlement des salles.</sn-info-banner>
    </div>

    <h2>États d'écran</h2>
    <sn-loading label="Chargement des réservations" />
    <sn-empty-state title="Aucune réservation" text="Vous n'avez pas encore réservé de salle.">
      <button snButton variant="primary" type="button">Réserver une salle</button>
    </sn-empty-state>
    <sn-error-state
      title="Chargement impossible"
      text="Le service est indisponible. Réessayez dans quelques minutes."
      (retry)="retries.set(retries() + 1)"
    />
    <p class="sn-text-muted">Nouvelles tentatives : {{ retries() }}</p>

    <h2>Carte</h2>
    <sn-card>
      <h3 snCardHeader>Croix-Rousse</h3>
      <p class="card-line">12/03/2026, de 14:00 à 15:00</p>
      <sn-status-badge status="confirmed" label="Confirmée" />
      <div snCardActions>
        <button snButton variant="secondary" type="button">Modifier</button>
      </div>
    </sn-card>

    <h2>Tableau</h2>
    <div class="sn-table-wrapper">
      <table class="sn-table">
        <thead>
          <tr>
            <th scope="col">Salle</th>
            <th scope="col">Date</th>
            <th scope="col">Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Croix-Rousse</td>
            <td>12/03/2026</td>
            <td><sn-status-badge status="confirmed" label="Confirmée" /></td>
          </tr>
          <tr>
            <td>Fourvière</td>
            <td>14/03/2026</td>
            <td><sn-status-badge status="pending" label="En attente" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>En-tête</h2>
    <p>
      L'en-tête de cette démonstration est celui du composant <code>sn-app-header</code> : avec
      l'utilisateur fictif « Camille Dupont », ouvrez son menu en haut à droite, ou le menu mobile
      en dessous de 960 px, puis essayez « Se déconnecter ».
    </p>
  `,
})
export class ComponentsPage {
  protected readonly dialog = viewChild.required(SnConfirmDialog);
  protected readonly deleted = signal(false);
  protected readonly retries = signal(0);
  protected readonly filter = signal('week');

  protected readonly tones = ['neutral', 'primary', 'accent', 'brand', 'solid', 'outline'] as const;
  protected readonly filters: SnFilterOption[] = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'past', label: 'Passées' },
  ];
  protected readonly pencil = LucidePencil.icon;
  protected readonly back = LucideArrowLeft.icon;
  protected readonly calendar = LucideCalendarPlus.icon;
}
