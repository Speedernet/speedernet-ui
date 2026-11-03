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
    { label: 'Foundations', link: '/foundations' },
    { label: 'Components', link: '/components' },
    { label: 'Sample screen', link: '/sample-screen' },
  ];
  protected readonly user: SnHeaderUser = { displayName: 'Camille Dupont' };
  protected readonly loggedOut = signal(false);
}
