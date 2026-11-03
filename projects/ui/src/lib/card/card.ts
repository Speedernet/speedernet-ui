import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Card with three projection slots, in this order: `[speedCardHeader]`, the default content,
 * then `[speedCardActions]`.
 */
@Component({
  selector: 'speed-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content select="[speedCardHeader]" />
    <ng-content />
    <ng-content select="[speedCardActions]" />
  `,
  styleUrl: './card.scss',
  host: { class: 'speed-card', role: 'article' },
})
export class SpeedCard {}
