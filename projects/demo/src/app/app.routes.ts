import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'fondations' },
  {
    path: 'fondations',
    title: 'Fondations · Démonstration',
    loadComponent: () => import('./pages/foundations-page').then((m) => m.FoundationsPage),
  },
  {
    path: 'composants',
    title: 'Composants · Démonstration',
    loadComponent: () => import('./pages/components-page').then((m) => m.ComponentsPage),
  },
  {
    path: 'ecran-type',
    title: 'Écran type · Démonstration',
    loadComponent: () => import('./pages/screen-page').then((m) => m.ScreenPage),
  },
];
