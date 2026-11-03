import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnAppHeader, SnHeaderUser, SnMessage, SnNavItem } from '@speedernet/ui';

@Component({
  imports: [RouterOutlet, SnAppHeader, SnMessage],
  selector: 'demo-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly navItems: SnNavItem[] = [
    { label: 'Fondations', link: '/fondations' },
    { label: 'Composants', link: '/composants' },
    { label: 'Écran type', link: '/ecran-type' },
  ];
  protected readonly user: SnHeaderUser = { displayName: 'Camille Dupont' };
  protected readonly loggedOut = signal(false);
}
