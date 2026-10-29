import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SnLogo } from '@speedernet/ui';

interface ContrastPair {
  pair: string;
  ratio: string;
  usage: string;
}

@Component({
  selector: 'demo-foundations-page',
  imports: [SnLogo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <h1>Les <span class="sn-highlight">fondations</span></h1>
    <p class="sn-text-muted">Couleurs, typographie, espacements et logos de l'écosystème.</p>

    <h2>Couleurs de la marque</h2>
    <div class="swatches">
      @for (c of brand; track c.token) {
        <div class="swatch">
          <span class="swatch__color" [style.background]="'var(' + c.token + ')'"></span>
          <span>{{ c.label }}</span>
          <code>{{ c.token }}</code>
        </div>
      }
    </div>

    <h2>Échelles</h2>
    @for (scale of scales; track scale) {
      <h3>{{ scale }}</h3>
      <div class="swatches swatches--scale">
        @for (step of steps; track step) {
          <div class="swatch">
            <span
              class="swatch__color"
              [style.background]="'var(--' + scale + '-' + step + ')'"
            ></span>
            <code>{{ scale }}-{{ step }}</code>
          </div>
        }
      </div>
    }

    <h2>Associations de couleurs autorisées</h2>
    <div class="sn-table-wrapper">
      <table class="sn-table">
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
      <sn-logo variant="mark" alt="Logo Speedernet, version courte" />
      <sn-logo variant="full" alt="Logo Speedernet, version complète" />
    </div>
  `,
})
export class FoundationsPage {
  protected readonly brand = [
    { label: 'Texte', token: '--color-text' },
    { label: 'Nuit', token: '--color-night' },
    { label: 'Primaire', token: '--color-primary' },
    { label: 'Accent', token: '--color-accent' },
    { label: 'Marque', token: '--color-brand' },
    { label: 'Danger', token: '--color-danger' },
  ];
  protected readonly scales = ['cyan', 'yellow', 'red', 'night', 'gray'];
  protected readonly steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  protected readonly spaces = [1, 2, 3, 4, 5, 6];
  protected readonly radii = ['--radius', '--radius-lg', '--radius-pill'];
  protected readonly pairs: ContrastPair[] = [
    { pair: 'Texte --color-text (#313131) sur blanc', ratio: '13,0:1', usage: 'Texte courant' },
    {
      pair: 'Texte secondaire --color-text-muted (#5e5e5e) sur blanc',
      ratio: '6,5:1',
      usage: 'Aides, mentions',
    },
    { pair: 'Blanc sur --color-danger', ratio: '6,2:1', usage: 'Bouton de suppression' },
    {
      pair: 'Texte sur teintes cyan et jaune',
      ratio: '≥ 9,8:1',
      usage: 'Messages, badges, bandeaux',
    },
    { pair: 'Bordure de champ (gray-600)', ratio: '3,8:1', usage: 'Contour des champs' },
    {
      pair: 'Texte --color-text sur --color-accent (#ffe44b)',
      ratio: '10,2:1',
      usage: 'Surlignage des titres, badges jaunes',
    },
  ];
}
