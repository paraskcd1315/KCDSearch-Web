import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/pages/home/home.routes').then(m => m.default)
  },
  {
    path: 'search',
    loadChildren: () => import('./modules/pages/search/search.routes').then(m => m.default)
  }
];
