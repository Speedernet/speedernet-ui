import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeedAppHeader, SpeedHeaderUser, SpeedMessage, SpeedNavItem } from '@speedernet/ui';

@Component({
  imports: [RouterOutlet, SpeedAppHeader, SpeedMessage],
  selector: 'demo-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly navItems: SpeedNavItem[] = [
    { label: 'Foundations', link: '/foundations' },
    { label: 'Components', link: '/components' },
    { label: 'Sample screen', link: '/sample-screen' },
  ];
  protected readonly user: SpeedHeaderUser = { displayName: 'Camille Dupont' };
  protected readonly loggedOut = signal(false);
}
