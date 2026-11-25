import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { readStyleGuide } from './style-guide/style-guide';
import { styleGuidePrompt } from './style-guide/style-guide-prompt';

/**
 * The whole style guide as plain text, read from the current tokens. The "Copier le prompt"
 * button of the foundations page sends AI agents here.
 */
@Component({
  selector: 'demo-style-guide-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pages.scss',
  template: `
    <h1>La <span class="speed-highlight">charte graphique</span> en texte</h1>
    <p class="speed-text-muted">
      Version texte de la charte, lue en direct dans les tokens de la bibliothèque, pour les agents
      d'IA et les copier-coller. Aperçu visuel : <a routerLink="/fondations">les fondations</a>.
    </p>
    @if (text()) {
      <pre class="guide-text" data-testid="style-guide-text">{{ text() }}</pre>
    } @else {
      <p>Lecture des tokens…</p>
    }
  `,
})
export class StyleGuidePage {
  protected readonly text = signal('');

  constructor() {
    // The stylesheets are only readable once the page is rendered in the browser.
    afterNextRender(() => this.text.set(styleGuidePrompt(readStyleGuide(document))));
  }
}
