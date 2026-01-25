import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/pages/home/home.routes').then(m => m.default)
  }
];
