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
    { label: 'Fondations', link: '/fondations' },
    { label: 'Composants', link: '/composants' },
    { label: 'Écran type', link: '/ecran-type' },
  ];
  protected readonly user: SpeedHeaderUser = { displayName: 'Camille Dupont' };
  protected readonly loggedOut = signal(false);
}
