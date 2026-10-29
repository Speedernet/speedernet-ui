import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SN_ASSETS_BASE } from '../assets-base';

/** Official Speedernet logo: the compact mark or the full logo. */
@Component({
  selector: 'sn-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img class="sn-logo__img" [src]="src()" [alt]="alt()" />`,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
    .sn-logo__img {
      display: block;
      height: 100%;
      width: auto;
      max-width: 100%;
    }
  `,
})
export class SnLogo {
  private readonly base = inject(SN_ASSETS_BASE);

  readonly variant = input<'mark' | 'full'>('mark');
  readonly alt = input('');

  protected readonly src = computed(
    () => `${this.base}/logos/logo-speedernet-${this.variant() === 'full' ? 'full' : 'min'}.svg`,
  );
}
