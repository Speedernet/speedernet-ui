import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Card with three projection slots, in this order: `[snCardHeader]`, the default content,
 * then `[snCardActions]`.
 */
@Component({
  selector: 'sn-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-content select="[snCardHeader]" />
    <ng-content />
    <ng-content select="[snCardActions]" />
  `,
  styleUrl: './card.scss',
  host: { class: 'sn-card', role: 'article' },
})
export class SnCard {}
