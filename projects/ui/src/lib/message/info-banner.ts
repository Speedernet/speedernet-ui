import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import { SpeedBadge } from '../badge/badge';
import { messageAppearance } from './message-appearance';

/** Information banner; becomes a link when `href` is set. */
@Component({
  selector: 'speed-info-banner',
  imports: [SpeedBadge, LucideDynamicIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (href(); as href) {
      <a class="speed-info-banner-body" [href]="href">
        <speed-badge [tone]="appearance.tone">{{ appearance.label }}</speed-badge>
        <span class="speed-info-banner-text"><ng-container [ngTemplateOutlet]="content" /></span>
        <svg [lucideIcon]="arrow" [size]="14" aria-hidden="true"></svg>
      </a>
    } @else {
      <div class="speed-info-banner-body">
        <speed-badge [tone]="appearance.tone">{{ appearance.label }}</speed-badge>
        <span class="speed-info-banner-text"><ng-container [ngTemplateOutlet]="content" /></span>
        <svg [lucideIcon]="arrow" [size]="14" aria-hidden="true"></svg>
      </div>
    }
  `,
  styleUrl: './message.scss',
  host: { class: 'speed-info-banner' },
})
export class SpeedInfoBanner {
  readonly href = input<string | null>(null);
  protected readonly appearance = messageAppearance('info');
  protected readonly arrow = LucideArrowRight.icon;
}
