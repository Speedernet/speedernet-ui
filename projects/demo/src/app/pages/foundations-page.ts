import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  SpeedButton,
  SpeedControl,
  SpeedDialog,
  SpeedField,
  SpeedLogo,
  SpeedToastService,
  SpeedTooltip,
} from '@speedernet/ui';
import { SwatchInfo, swatchInfo } from './color';
import { readStyleGuide } from './style-guide/style-guide';
import { creationPrompt } from './style-guide/style-guide-prompt';

interface ContrastPair {
  pair: string;
  ratio: string;
  usage: string;
}

@Component({
  selector: 'demo-foundations-page',
  imports: [SpeedButton, SpeedControl, SpeedDialog, SpeedField, SpeedLogo, SpeedTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <div class="page-head">
      <h1>Les <span class="speed-highlight">fondations</span></h1>
      <div class="row">
        <button
          speedButton
          variant="secondary"
          type="button"
          [disabled]="generating()"
          (click)="downloadPdf()"
        >
          {{ generating() ? 'Génération du PDF…' : 'Télécharger en PDF' }}
        </button>
        <button speedButton variant="primary" type="button" (click)="openCreate()">
          Je veux créer
        </button>
      </div>
    </div>
    <speed-dialog title="Je veux créer" (closed)="requestError.set(null)">
      <speed-field label="" [error]="requestError()">
        <textarea
          speedControl
          rows="5"
          placeholder="Par exemple : « Je veux faire un visuel LinkedIn pour promouvoir notre webinaire sur...» ou « Je veux faire des slides pour une présentation sur...»."
          [value]="request()"
          (input)="onRequestInput($event)"
        ></textarea>
      </speed-field>
      <p class="speed-text-muted">
        Le prompt copié reprend votre idée, puis demande à l’agent de suivre la charte graphique
        publiée sur cette démonstration. Votre agent doit être installé et équipé d'un navigateur
        (par exemple une session Claude Code sur l'application desktop).
      </p>
      <button speedDialogActions speedButton type="button" (click)="dialog().close()">
        Annuler
      </button>
      <button
        speedDialogActions
        speedButton
        variant="primary"
        type="button"
        [disabled]="!request().trim()"
        (click)="copyPrompt()"
      >
        Copier le prompt
      </button>
    </speed-dialog>
    <p class="speed-text-muted">Couleurs, typographie, espacements et logos de l'écosystème.</p>

    <h2>Couleurs de la marque</h2>
    <p class="speed-text-muted">Cliquez sur une couleur pour copier sa valeur hexa.</p>
    <p class="visually-hidden" aria-live="polite">{{ copiedMessage() }}</p>
    <div class="swatches">
      @for (c of brand; track c.token) {
        <div class="swatch">
          <speed-tooltip class="copy-color-tooltip" [text]="tooltipText(c.token.slice(2))">
            <button
              type="button"
              class="swatch__color copy-color"
              [style.background]="'var(' + c.token + ')'"
              [attr.aria-label]="c.token"
              (click)="copy(c.token.slice(2))"
            ></button>
          </speed-tooltip>
          <span>{{ c.label }}</span>
          <code>{{ c.token }}</code>
        </div>
      }
    </div>

    <h2>Échelles</h2>
    @for (scale of scales; track scale) {
      <h3>{{ scale }}</h3>
      <div class="scale">
        @for (step of steps; track step) {
          @let token = scale + '-' + step;
          @let info = infos()[token];
          <div class="scale__step">
            <speed-tooltip class="copy-color-tooltip" [text]="tooltipText(token)">
              <button
                type="button"
                class="scale__color copy-color"
                [class.scale__color--anchor]="isAnchor(scale, step)"
                [class.scale__color--light]="info?.text === 'light'"
                [style.background]="'var(--' + token + ')'"
                [attr.aria-label]="'--' + token"
                (click)="copy(token)"
              >
                <span class="scale__name">{{ step }}</span>
                <span class="scale__sample" aria-hidden="true">Aa</span>
              </button>
            </speed-tooltip>
            <code>--{{ token }}</code>
            @if (info) {
              <span class="scale__ratio">{{ ratioLabel(info.ratio) }} · {{ info.level }}</span>
            }
            <!-- @if (isAnchor(scale, step)) {
              <span class="speed-text-muted">couleur de marque</span>
            } -->
          </div>
        }
      </div>
    }

    <h2>Associations de couleurs autorisées</h2>
    <div class="speed-table-wrapper">
      <table class="speed-table">
        <caption class="visually-hidden">
          Associations de couleurs autorisées
        </caption>
        <thead>
          <tr>
            <th scope="col">Association</th>
            <th scope="col">Contraste</th>
            <th scope="col">Usage</th>
          </tr>
        </thead>
        <tbody>
          @for (p of pairs; track p.pair) {
            <tr>
              <td>{{ p.pair }}</td>
              <td>{{ p.ratio }}</td>
              <td>{{ p.usage }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <h2>Typographie</h2>
    <div class="type-scale">
      <p class="type-h1-desktop">Titre 1 · ordinateur (2 rem)</p>
      <p class="type-h1-phone">Titre 1 · téléphone (1,625 rem)</p>
      <p class="type-h2">Titre 2 (1,5 rem)</p>
      <p class="type-h3">Titre 3 (1,25 rem)</p>
      <p>Texte courant (1 rem), police Mulish, interligne confortable.</p>
    </div>

    <h2>Espacements et arrondis</h2>
    <div class="spacing">
      @for (s of spaces; track s) {
        <div class="spacing__item">
          <span class="spacing__bar" [style.width]="'var(--space-' + s + ')'"></span>
          <code>--space-{{ s }}</code>
        </div>
      }
    </div>
    <div class="swatches">
      @for (r of radii; track r) {
        <div class="swatch">
          <span class="radius-box" [style.border-radius]="'var(' + r + ')'"></span>
          <code>{{ r }}</code>
        </div>
      }
    </div>

    <h2>Logos</h2>
    <div class="logos">
      <speed-logo variant="mark" alt="Logo Speedernet, version courte" />
      <speed-logo variant="full" alt="Logo Speedernet, version complète" />
    </div>
  `,
})
export class FoundationsPage {
  private readonly toast = inject(SpeedToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly generating = signal(false);

  /** Builds the style guide PDF from the tokens currently applied to the page and downloads it. */
  protected async downloadPdf(): Promise<void> {
    this.generating.set(true);
    try {
      // Loaded on demand: the PDF layout is only needed when the button is used.
      const [{ styleGuidePdf }, { loadPdfFonts }] = await Promise.all([
        import('./style-guide/style-guide-pdf'),
        import('./style-guide/pdf-fonts'),
      ]);
      const guide = readStyleGuide(document);
      const bytes = styleGuidePdf(guide, await loadPdfFonts(guide.fontFamily));
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'charte-graphique-speedernet.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      this.toast.show("Le PDF n'a pas pu être généré.", { type: 'error' });
    } finally {
      this.generating.set(false);
    }
  }

  protected readonly dialog = viewChild.required(SpeedDialog);
  /** What the user wants to create, kept between openings of the dialog. */
  protected readonly request = signal('');
  protected readonly requestError = signal<string | null>(null);

  protected openCreate(): void {
    this.dialog().open();
  }

  protected onRequestInput(event: Event): void {
    this.request.set((event.target as HTMLTextAreaElement).value);
    if (this.request().trim()) this.requestError.set(null);
  }

  /** Copies the user's request followed by an instruction to read the style guide on this demo. */
  protected async copyPrompt(): Promise<void> {
    if (!this.request().trim()) {
      this.requestError.set('Décrivez ce que vous voulez créer.');
      this.host.nativeElement.querySelector<HTMLElement>('speed-dialog textarea')?.focus();
      return;
    }
    try {
      // The agent reads the guide on the demo, which always has the current tokens.
      await navigator.clipboard.writeText(creationPrompt(this.request(), document.baseURI));
      this.dialog().close();
      this.toast.show('Prompt copié : collez-le dans votre agent.');
    } catch {
      this.toast.show("Le prompt n'a pas pu être copié.", { type: 'error' });
    }
  }

  protected readonly brand = [
    { label: 'Texte', token: '--color-text' },
    { label: 'Nuit', token: '--color-night' },
    { label: 'Primaire', token: '--color-primary' },
    { label: 'Accent', token: '--color-accent' },
    { label: 'Marque', token: '--color-brand' },
    { label: 'Danger', token: '--color-danger' },
  ];
  protected readonly scales = ['cyan', 'yellow', 'red', 'night', 'gray'];
  protected readonly steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  protected readonly anchors = ['cyan-500', 'yellow-500', 'red-500', 'gray-900', 'night-950'];
  protected isAnchor(scale: string, step: number): boolean {
    return this.anchors.includes(`${scale}-${step}`);
  }
  /** Token values read from the page styles, e.g. { 'cyan-400': 'oklch(76.1% 0.129 205.7)' }
   * (scale steps and brand colors, without the leading "--"). */
  protected readonly values = signal<Record<string, string>>({});
  protected readonly infos = computed(() => {
    const infos: Record<string, SwatchInfo | null> = {};
    for (const [token, value] of Object.entries(this.values())) infos[token] = swatchInfo(value);
    return infos;
  });
  /** Rounded down so that a ratio just under a WCAG threshold never reads as reaching it. */
  protected ratioLabel(ratio: number): string {
    return `${(Math.floor(ratio * 10) / 10).toFixed(1).replace('.', ',')}:1`;
  }

  /** Token whose hex value was just copied; its tooltip says "Copié" for a moment. */
  protected readonly copied = signal<string | null>(null);
  protected readonly copiedMessage = computed(() => {
    const token = this.copied();
    return token ? `${this.infos()[token]?.hex} copié dans le presse-papiers` : '';
  });
  private copiedTimer?: ReturnType<typeof setTimeout>;

  protected tooltipText(token: string): string {
    const hex = this.infos()[token]?.hex ?? '';
    return this.copied() === token ? `${hex} copié` : `Copier ${hex}`;
  }

  protected async copy(token: string): Promise<void> {
    const hex = this.infos()[token]?.hex;
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      return; // Clipboard refused (insecure page or permission denied): nothing to confirm.
    }
    this.copied.set(token);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(null), 1500);
  }

  constructor() {
    afterNextRender(() => {
      const style = getComputedStyle(document.documentElement);
      const values: Record<string, string> = {};
      // Brand tokens point to a scale step; the browser resolves the var() to its OKLCH value.
      for (const { token } of this.brand) {
        values[token.slice(2)] = style.getPropertyValue(token).trim();
      }
      for (const scale of this.scales) {
        for (const step of this.steps) {
          values[`${scale}-${step}`] = style.getPropertyValue(`--${scale}-${step}`).trim();
        }
      }
      this.values.set(values);
    });
  }
  protected readonly spaces = [1, 2, 3, 4, 5, 6];
  protected readonly radii = ['--radius', '--radius-lg', '--radius-pill'];
  protected readonly pairs: ContrastPair[] = [
    { pair: 'Texte --color-text (#313131) sur blanc', ratio: '13,0:1', usage: 'Texte courant' },
    {
      pair: 'Texte secondaire --color-text-muted (#5e5e5e) sur blanc',
      ratio: '6,5:1',
      usage: 'Aides, mentions',
    },
    { pair: 'Blanc sur --color-danger', ratio: '5,2:1', usage: 'Bouton de suppression' },
    {
      pair: 'Texte sur teintes cyan et jaune',
      ratio: '≥ 9,8:1',
      usage: 'Messages, badges, bandeaux',
    },
    { pair: 'Bordure de champ (gray-600)', ratio: '3,4:1', usage: 'Contour des champs' },
    {
      pair: 'Texte --color-text sur --color-accent (#ffe44b)',
      ratio: '10,2:1',
      usage: 'Surlignage des titres, badges jaunes',
    },
  ];
}
