import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { SpeedLogo, SpeedTooltip } from '@speedernet/ui';
import { SwatchInfo, swatchInfo } from './color';

interface ContrastPair {
  pair: string;
  ratio: string;
  usage: string;
}

@Component({
  selector: 'demo-foundations-page',
  imports: [SpeedLogo, SpeedTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <h1>The <span class="speed-highlight">foundations</span></h1>
    <p class="speed-text-muted">Colors, typography, spacing and logos of the ecosystem.</p>

    <h2>Brand colors</h2>
    <p class="speed-text-muted">Click a color to copy its hex value.</p>
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

    <h2>Scales</h2>
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
              <span class="speed-text-muted">brand color</span>
            } -->
          </div>
        }
      </div>
    }

    <h2>Allowed color pairings</h2>
    <div class="speed-table-wrapper">
      <table class="speed-table">
        <caption class="visually-hidden">
          Allowed color pairings
        </caption>
        <thead>
          <tr>
            <th scope="col">Pairing</th>
            <th scope="col">Contrast</th>
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

    <h2>Typography</h2>
    <div class="type-scale">
      <p class="type-h1-desktop">Heading 1 · desktop (2 rem)</p>
      <p class="type-h1-phone">Heading 1 · phone (1.625 rem)</p>
      <p class="type-h2">Heading 2 (1.5 rem)</p>
      <p class="type-h3">Heading 3 (1.25 rem)</p>
      <p>Body text (1 rem), Mulish font, comfortable line height.</p>
    </div>

    <h2>Spacing and radii</h2>
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
      <speed-logo variant="mark" alt="Speedernet logo, short version" />
      <speed-logo variant="full" alt="Speedernet logo, full version" />
    </div>
  `,
})
export class FoundationsPage {
  protected readonly brand = [
    { label: 'Text', token: '--color-text' },
    { label: 'Night', token: '--color-night' },
    { label: 'Primary', token: '--color-primary' },
    { label: 'Accent', token: '--color-accent' },
    { label: 'Brand', token: '--color-brand' },
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
    return `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`;
  }

  /** Token whose hex value was just copied; its tooltip says "copied" for a moment. */
  protected readonly copied = signal<string | null>(null);
  protected readonly copiedMessage = computed(() => {
    const token = this.copied();
    return token ? `${this.infos()[token]?.hex} copied to the clipboard` : '';
  });
  private copiedTimer?: ReturnType<typeof setTimeout>;

  protected tooltipText(token: string): string {
    const hex = this.infos()[token]?.hex ?? '';
    return this.copied() === token ? `${hex} copied` : `Copy ${hex}`;
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
    { pair: 'Text --color-text (#313131) on white', ratio: '13.0:1', usage: 'Body text' },
    {
      pair: 'Secondary text --color-text-muted (#5e5e5e) on white',
      ratio: '6.5:1',
      usage: 'Hints, notes',
    },
    { pair: 'White on --color-danger', ratio: '5.2:1', usage: 'Delete button' },
    {
      pair: 'Text on cyan and yellow tints',
      ratio: '≥ 9.8:1',
      usage: 'Messages, badges, banners',
    },
    { pair: 'Field border (gray-600)', ratio: '3.4:1', usage: 'Field outlines' },
    {
      pair: 'Text --color-text on --color-accent (#ffe44b)',
      ratio: '10.2:1',
      usage: 'Heading highlight, yellow badges',
    },
  ];
}
