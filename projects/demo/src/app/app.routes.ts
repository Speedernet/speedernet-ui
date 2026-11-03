import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'foundations' },
  {
    path: 'foundations',
    title: 'Foundations · Demo',
    loadComponent: () => import('./pages/foundations-page').then((m) => m.FoundationsPage),
  },
  {
    path: 'components',
    title: 'Components · Demo',
    loadComponent: () => import('./pages/components-page').then((m) => m.ComponentsPage),
  },
  {
    path: 'sample-screen',
    title: 'Sample screen · Demo',
    loadComponent: () => import('./pages/screen-page').then((m) => m.ScreenPage),
  },
];
