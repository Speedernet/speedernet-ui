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
  SpeedFileInput,
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
    SpeedFileInput,
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
    <h1>Les <span class="speed-highlight">composants</span></h1>
    <p class="speed-text-muted">Chaque composant dans toutes ses variantes et ses états.</p>

    <h2>Boutons</h2>
    <div id="buttons" class="row">
      <button speedButton variant="primary" type="button">Réserver une salle</button>
      <button speedButton variant="secondary" type="button">Annuler</button>
      <button speedButton variant="danger" type="button" (click)="dialog().open()">
        Supprimer la réservation
      </button>
      <button speedButton variant="primary" type="button" disabled>Désactivé</button>
      <a speedButton variant="secondary" href="/composants#buttons">Lien en bouton</a>
    </div>
    <h3>Boutons-icônes</h3>
    <div class="row">
      <button
        speedIconButton
        label="Modifier"
        [icon]="pencil"
        variant="light"
        type="button"
      ></button>
      <button speedIconButton label="Retour" [icon]="back" variant="dark" type="button"></button>
    </div>
    @if (deleted()) {
      <speed-message type="success">Réservation du 12/03 supprimée.</speed-message>
    }
    <speed-confirm-dialog
      title="Supprimer la réservation du 12/03 ?"
      confirmLabel="Supprimer"
      (confirmed)="deleted.set(true)"
    >
      Salle Croix-Rousse, de 14:00 à 15:00. Cette action est définitive.
    </speed-confirm-dialog>

    <h2>Fenêtre modale</h2>
    <div class="row">
      <button speedButton variant="secondary" type="button" (click)="formDialog.open()">
        Avec formulaire
      </button>
      <button speedButton variant="secondary" type="button" (click)="longDialog.open()">
        Contenu long
      </button>
      <button speedButton variant="secondary" type="button" (click)="infoDialog.open()">
        Sans actions
      </button>
      <button speedButton variant="danger" type="button" (click)="dialog().open()">
        Confirmation
      </button>
    </div>
    <p class="speed-text-muted">Dernière fermeture : {{ lastClose() }}</p>
    <speed-dialog #formDialog title="Modifier la réservation" (dismissed)="lastClose.set('Échap')">
      <div class="stack">
        <speed-field label="Date" hint="Format attendu : jj/mm/aaaa.">
          <input speedControl type="text" value="12/03/2026" />
        </speed-field>
        <speed-field label="Commentaire">
          <textarea speedControl rows="3"></textarea>
        </speed-field>
      </div>
      <button
        speedDialogActions
        speedButton
        type="button"
        (click)="closeWith(formDialog, 'Annuler')"
      >
        Annuler
      </button>
      <button
        speedDialogActions
        speedButton
        variant="primary"
        type="button"
        (click)="closeWith(formDialog, 'Enregistrer')"
      >
        Enregistrer
      </button>
    </speed-dialog>
    <speed-dialog #longDialog title="Règlement des salles" (dismissed)="lastClose.set('Échap')">
      @for (n of rules; track n) {
        <p>
          Article {{ n }}. Les salles se réservent au plus 30 jours à l'avance, pour un créneau de
          quatre heures au maximum. Libérez la salle à l'heure et laissez-la rangée.
        </p>
      }
      <button
        speedDialogActions
        speedButton
        variant="primary"
        type="button"
        (click)="closeWith(longDialog, 'J’ai compris')"
      >
        J’ai compris
      </button>
    </speed-dialog>
    <speed-dialog #infoDialog title="Salle Confluence" (dismissed)="lastClose.set('Échap')">
      <p>Projecteur, tableau blanc, 12 places. Fermez avec Échap.</p>
    </speed-dialog>
    <h2>Menu d'actions</h2>
    <div class="row">
      <speed-action-menu label="Actions pour la réservation du 12/03">
        <button speedMenuItem [icon]="pencil" (click)="menuChoice.set('Modifier')">Modifier</button>
        <button speedMenuItem [icon]="copy" (click)="menuChoice.set('Dupliquer')">Dupliquer</button>
        <button speedMenuItem [icon]="cancel" tone="danger" (click)="menuChoice.set('Annuler')">
          Annuler la réservation
        </button>
      </speed-action-menu>
      <speed-action-menu label="Actions pour la réservation du 02/02 (passée)">
        <button speedMenuItem (click)="menuChoice.set('Dupliquer')">Dupliquer</button>
        <button speedMenuItem disabled>Modifier</button>
        <button speedMenuItem tone="danger" disabled>Annuler la réservation</button>
      </speed-action-menu>
    </div>
    <h3>Menu sur un autre bouton</h3>
    <p class="speed-text-muted">
      <code>speedMenuTrigger</code> ouvre un <code>speed-menu</code> depuis n'importe quel bouton,
      comme le menu utilisateur de l'en-tête.
    </p>
    <div class="row">
      <button speedButton type="button" [speedMenuTrigger]="exportMenu">Exporter</button>
      <speed-menu #exportMenu>
        <button speedMenuItem (click)="menuChoice.set('Exporter en PDF')">En PDF</button>
        <button speedMenuItem (click)="menuChoice.set('Exporter en tableur')">En tableur</button>
      </speed-menu>
    </div>
    <p class="speed-text-muted">
      Avec icônes et action dangereuse, sans icônes avec actions désactivées, puis sur un bouton
      classique. Dernier choix : {{ menuChoice() }}
    </p>

    <h2>Badges</h2>
    <div class="row">
      @for (tone of tones; track tone) {
        <speed-badge [tone]="tone">{{ tone }}</speed-badge>
      }
      <speed-badge tone="primary" [icon]="calendar">Avec icône</speed-badge>
    </div>
    <h3>Statuts</h3>
    <div class="row">
      <speed-status-badge status="confirmed" label="Confirmée" />
      <speed-status-badge status="pending" label="En attente" />
      <speed-status-badge status="cancelled" label="Annulée" />
      <speed-status-badge status="archived" label="Archivée" />
    </div>

    <h2>Infobulle</h2>
    <div class="row">
      <speed-tooltip text="Modifier la réservation">
        <button
          speedIconButton
          label="Modifier"
          [icon]="pencil"
          variant="light"
          type="button"
        ></button>
      </speed-tooltip>
      <speed-tooltip text="Revenir à la liste">
        <button speedButton variant="secondary" type="button">Retour</button>
      </speed-tooltip>
    </div>

    <h2>Filtres</h2>
    <speed-filter-tabs label="Période des réservations" [options]="filters" [(value)]="filter" />
    <p class="speed-text-muted">Filtre sélectionné : {{ filter() }}</p>

    <h2>Champs</h2>
    <div class="stack">
      <speed-field label="Date" hint="Format attendu : jj/mm/aaaa.">
        <input speedControl type="text" value="12/03/2026" />
      </speed-field>
      <speed-field
        label="Date de fin"
        error="Cette date n'existe pas. Format attendu : jj/mm/aaaa."
      >
        <input speedControl type="text" value="31/02/2026" />
      </speed-field>
      <speed-field label="Commentaire">
        <textarea speedControl rows="3"></textarea>
      </speed-field>
      <speed-field label="Champ désactivé">
        <input speedControl type="text" value="Non modifiable" disabled />
      </speed-field>
    </div>

    <h3>Liste déroulante</h3>
    <div class="stack">
      <speed-select label="Salle">
        <select speedControl>
          <option value="" disabled selected>Choisir une salle</option>
          @for (room of rooms; track room) {
            <option>{{ room }}</option>
          }
        </select>
      </speed-select>
      <speed-select label="Créneau" hint="Les créneaux durent une heure.">
        <select speedControl>
          <option>09:00 - 10:00</option>
          <option selected>14:00 - 15:00</option>
          <option>16:00 - 17:00</option>
        </select>
      </speed-select>
      <speed-select label="Salle de repli" error="Choisissez une salle de repli.">
        <select speedControl>
          <option value="" disabled selected>Choisir une salle</option>
          @for (room of rooms; track room) {
            <option>{{ room }}</option>
          }
        </select>
      </speed-select>
      <speed-select label="Étage" hint="Fixé par la salle choisie.">
        <select speedControl disabled>
          <option>3e étage</option>
        </select>
      </speed-select>
    </div>

    <h3>Fichier</h3>
    <div class="stack">
      <speed-file-input label="Justificatif" hint="PDF ou image, 5 Mo maximum.">
        <input type="file" speedControl accept=".pdf,image/*" />
      </speed-file-input>
      <speed-file-input
        label="Pièces jointes"
        hint="PDF ou Word uniquement."
        dropLabel="Glissez-déposez vos fichiers ici"
        buttonLabel="Choisir des fichiers"
      >
        <input type="file" speedControl accept=".pdf,.docx" multiple />
      </speed-file-input>
      <speed-file-input label="Plan de la salle" error="Le fichier dépasse 5 Mo.">
        <input type="file" speedControl />
      </speed-file-input>
      <speed-file-input label="Photo de la salle" hint="Fournie par l'accueil.">
        <input type="file" speedControl disabled />
      </speed-file-input>
    </div>

    <h3>Cases à cocher</h3>
    <div class="stack">
      <speed-checkbox label="Ajouter un vidéoprojecteur">
        <input type="checkbox" speedControl />
      </speed-checkbox>
      <speed-checkbox label="Réservation récurrente" hint="Chaque semaine, le même jour.">
        <input type="checkbox" speedControl checked />
      </speed-checkbox>
      <speed-checkbox
        label="J'accepte le règlement des salles"
        error="Acceptez le règlement pour réserver."
      >
        <input type="checkbox" speedControl />
      </speed-checkbox>
      <speed-checkbox label="Accès handicapé (toutes les salles)">
        <input type="checkbox" speedControl checked disabled />
      </speed-checkbox>
      <speed-checkbox label="Traiteur (indisponible)">
        <input type="checkbox" speedControl disabled />
      </speed-checkbox>
    </div>

    <h3>Boutons radio</h3>
    <div class="stack">
      <speed-radio-group legend="Durée" hint="Une réservation dure au plus deux heures.">
        <speed-radio label="30 minutes">
          <input type="radio" name="duration" value="30" speedControl />
        </speed-radio>
        <speed-radio label="1 heure" hint="Le plus fréquent pour une réunion.">
          <input type="radio" name="duration" value="60" speedControl checked />
        </speed-radio>
        <speed-radio label="2 heures">
          <input type="radio" name="duration" value="120" speedControl />
        </speed-radio>
        <speed-radio label="Journée entière (sur demande)">
          <input type="radio" name="duration" value="day" speedControl disabled />
        </speed-radio>
      </speed-radio-group>
      <speed-radio-group
        legend="Disposition de la salle"
        orientation="horizontal"
        error="Choisissez une disposition."
      >
        <speed-radio label="Réunion">
          <input type="radio" name="layout" value="meeting" speedControl />
        </speed-radio>
        <speed-radio label="Conférence">
          <input type="radio" name="layout" value="conference" speedControl />
        </speed-radio>
        <speed-radio label="Atelier">
          <input type="radio" name="layout" value="workshop" speedControl />
        </speed-radio>
      </speed-radio-group>
    </div>

    <h3>Interrupteurs</h3>
    <div class="stack">
      <speed-switch label="Recevoir une confirmation par courriel">
        <input type="checkbox" role="switch" speedControl checked />
      </speed-switch>
      <speed-switch label="Rappel la veille" hint="Envoyé à 18:00.">
        <input type="checkbox" role="switch" speedControl />
      </speed-switch>
      <speed-switch label="Partager avec mon équipe" error="Vous n'avez pas encore d'équipe.">
        <input type="checkbox" role="switch" speedControl />
      </speed-switch>
      <speed-switch label="Synchroniser l'agenda (géré par l'administrateur)">
        <input type="checkbox" role="switch" speedControl checked disabled />
      </speed-switch>
      <speed-switch label="Mode hors ligne (bientôt)">
        <input type="checkbox" role="switch" speedControl disabled />
      </speed-switch>
    </div>

    <h2>Messages</h2>
    <div class="stack">
      <speed-message type="success">
        Réservation enregistrée : salle Croix-Rousse, le 12/03/2026.
      </speed-message>
      <speed-message type="info">
        Les réservations sont ouvertes jusqu'à 30 jours à l'avance.
      </speed-message>
      <speed-message type="warning">
        Salle déjà réservée à 15:00 : votre créneau s'arrêtera à 15:00.
      </speed-message>
      <speed-message type="error">
        Le service est indisponible. Réessayez dans quelques minutes.
      </speed-message>
      <speed-info-banner>Nouveau : les salles Confluence sont réservables.</speed-info-banner>
      <speed-info-banner href="#">Consulter le règlement des salles.</speed-info-banner>
    </div>

    <h2>Notification temporaire</h2>
    <div class="row">
      <button speedButton type="button" (click)="toastSimple()">Simple</button>
      <button speedButton type="button" (click)="toastWithAction()">Avec action « Annuler »</button>
      <button speedButton type="button" (click)="toastLong()">Texte long</button>
      <button speedButton type="button" (click)="toastError()">Erreur</button>
    </div>
    <p class="speed-text-muted">Résultat du dernier toast : {{ toastResult() }}</p>

    <h2>États d'écran</h2>
    <speed-loading label="Chargement des réservations" />
    <speed-empty-state title="Aucune réservation" text="Vous n'avez pas encore réservé de salle.">
      <button speedButton variant="primary" type="button">Réserver une salle</button>
    </speed-empty-state>
    <speed-error-state
      title="Chargement impossible"
      text="Le service est indisponible. Réessayez dans quelques minutes."
      (retry)="retries.set(retries() + 1)"
    />
    <p class="speed-text-muted">Nouvelles tentatives : {{ retries() }}</p>

    <h2>Carte</h2>
    <speed-card>
      <h3 speedCardHeader>Croix-Rousse</h3>
      <p class="card-line">12/03/2026, de 14:00 à 15:00</p>
      <speed-status-badge status="confirmed" label="Confirmée" />
      <div speedCardActions>
        <button speedButton variant="secondary" type="button">Modifier</button>
      </div>
    </speed-card>

    <h2>Tableau</h2>
    <div class="speed-table-wrapper">
      <table class="speed-table">
        <thead>
          <tr>
            <th scope="col">Salle</th>
            <th scope="col">Date</th>
            <th scope="col">Statut</th>
            <th scope="col"><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Croix-Rousse</td>
            <td>12/03/2026</td>
            <td><speed-status-badge status="confirmed" label="Confirmée" /></td>
            <td>
              <speed-action-menu label="Actions pour Croix-Rousse le 12/03/2026">
                <button speedMenuItem [icon]="pencil">Modifier</button>
                <button speedMenuItem [icon]="copy">Dupliquer</button>
                <button speedMenuItem [icon]="cancel" tone="danger">Annuler la réservation</button>
              </speed-action-menu>
            </td>
          </tr>
          <tr>
            <td>Fourvière</td>
            <td>14/03/2026</td>
            <td><speed-status-badge status="pending" label="En attente" /></td>
            <td>
              <speed-action-menu label="Actions pour Fourvière le 14/03/2026">
                <button speedMenuItem [icon]="pencil">Modifier</button>
                <button speedMenuItem [icon]="copy">Dupliquer</button>
                <button speedMenuItem [icon]="cancel" tone="danger">Annuler la réservation</button>
              </speed-action-menu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>En-tête</h2>
    <p>
      L'en-tête de cette démonstration est celui du composant <code>speed-app-header</code> : avec
      l'utilisateur fictif « Camille Dupont », ouvrez son menu en haut à droite, ou le menu mobile
      en dessous de 960 px, puis essayez « Se déconnecter ».
    </p>
  `,
})
export class ComponentsPage {
  protected readonly dialog = viewChild.required(SpeedConfirmDialog);
  protected readonly lastClose = signal('aucune');
  protected readonly rules = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly deleted = signal(false);
  protected readonly retries = signal(0);
  protected readonly toastResult = signal('aucun');
  private readonly toast = inject(SpeedToastService);
  protected readonly menuChoice = signal('aucun');
  protected readonly rooms = ['Croix-Rousse', 'Fourvière', 'Confluence'];
  protected readonly filter = signal('week');

  protected readonly tones = ['neutral', 'primary', 'accent', 'brand', 'solid', 'outline'] as const;
  protected readonly filters: SpeedFilterOption[] = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'past', label: 'Passées' },
  ];
  protected readonly pencil = LucidePencil.icon;
  protected readonly copy = LucideCopy.icon;
  protected readonly cancel = LucideX.icon;
  protected readonly back = LucideArrowLeft.icon;
  protected readonly calendar = LucideCalendarPlus.icon;

  protected toastSimple(): void {
    this.track(this.toast.show('Réservation enregistrée.'));
  }

  protected toastWithAction(): void {
    this.track(this.toast.show('Réservation du 12/03 supprimée.', { action: 'Annuler' }));
  }

  protected toastLong(): void {
    this.track(
      this.toast.show(
        'Réservation enregistrée : salle Croix-Rousse, le 12/03/2026 de 14:00 à 15:00. Un courriel de confirmation vous a été envoyé.',
      ),
    );
  }

  protected toastError(): void {
    this.track(
      this.toast.show("La réservation n'a pas pu être supprimée.", {
        type: 'error',
        action: 'Réessayer',
      }),
    );
  }

  private track(ref: SpeedToastRef): void {
    this.toastResult.set('affiché');
    ref.result.then((result) =>
      this.toastResult.set(result === 'action' ? 'action « Annuler »' : 'fermé'),
    );
  }

  protected closeWith(dialog: SpeedDialog, action: string): void {
    dialog.close();
    this.lastClose.set(action);
  }
}
