import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'requests',
    loadComponent: () => import('./features/requests/requests.component').then(m => m.RequestsComponent),
    canActivate: [AuthGuard]
  },

  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: '**', redirectTo: '/requests' }
];
