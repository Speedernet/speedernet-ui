import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import { SnBadge } from '../badge/badge';

/** Information banner; becomes a link when `href` is set. */
@Component({
  selector: 'sn-info-banner',
  imports: [SnBadge, LucideDynamicIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (href(); as href) {
      <a class="sn-info-banner-body" [href]="href">
        <sn-badge tone="primary">Info</sn-badge>
        <span class="sn-info-banner-text"><ng-container [ngTemplateOutlet]="content" /></span>
        <svg [lucideIcon]="arrow" [size]="14" aria-hidden="true"></svg>
      </a>
    } @else {
      <div class="sn-info-banner-body">
        <sn-badge tone="primary">Info</sn-badge>
        <span class="sn-info-banner-text"><ng-container [ngTemplateOutlet]="content" /></span>
        <svg [lucideIcon]="arrow" [size]="14" aria-hidden="true"></svg>
      </div>
    }
  `,
  styleUrl: './message.scss',
  host: { class: 'sn-info-banner' },
})
export class SnInfoBanner {
  readonly href = input<string | null>(null);
  protected readonly arrow = LucideArrowRight.icon;
}
