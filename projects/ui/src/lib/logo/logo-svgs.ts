import { ChangeDetectionStrategy, Component } from '@angular/core';

// The logo SVGs, used as templates: Angular compiles them into the components, so applications
// have no file to serve. Internal to SpeedLogo.

const styles = `
  :host {
    display: block;
    height: 100%;
    line-height: 0;
  }
  svg {
    display: block;
    height: 100%;
    width: auto;
    max-width: 100%;
  }
`;

@Component({
  selector: 'speed-logo-full',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../../../assets/logos/logo-speedernet-full.svg',
  styles,
})
export class SpeedLogoFull {}

@Component({
  selector: 'speed-logo-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../../../assets/logos/logo-speedernet-min.svg',
  styles,
})
export class SpeedLogoMark {}
