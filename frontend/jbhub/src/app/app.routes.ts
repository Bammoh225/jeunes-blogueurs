import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'inscription',
        loadComponent: () => import('./features/blogueurs/inscription/inscription').then(m => m.Inscription)
      }
    ]
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/profil/profil').then(m => m.Profil)
      },
      {
        path: 'distributions',
        loadComponent: () => import('./features/distributions/distributions').then(m => m.Distributions)
      },
      {
        path: 'distributions/:id',
        loadComponent: () => import('./features/distributions/detail/detail').then(m => m.Detail)
      },
      {
        path: 'blogueurs',
        loadComponent: () => import('./features/blogueurs/liste/liste').then(m => m.Liste)
      },
      {
        path: 'blogueurs/:id',
        loadComponent: () => import('./features/blogueurs/detail/detail').then(m => m.Detail)
      },
      {
        path: 'publications',
        loadComponent: () => import('./features/publications/liste/liste').then(m => m.Liste)
      },
      {
        path: 'publications/soumettre',
        loadComponent: () => import('./features/publications/soumettre/soumettre').then(m => m.Soumettre)
      },
      {
        path: 'publications/:id',
        loadComponent: () => import('./features/publications/detail/detail').then(m => m.Detail)
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./features/evaluations/liste/liste').then(m => m.Liste)
      },
      {
        path: 'activites',
        loadComponent: () => import('./features/activites/liste/liste').then(m => m.Liste)
      },
      {
        path: 'activites/:id',
        loadComponent: () => import('./features/activites/detail/detail').then(m => m.Detail)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications').then(m => m.Notifications)
      },
      {
        path: 'utilisateurs',
        canActivate: [roleGuard],
        data: { roles: ['responsable_unicef', 'responsable_technique'] },
        loadComponent: () => import('./features/utilisateurs/liste/liste').then(m => m.Liste)
      }
    ]
  },

  { path: '**', loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound) }
];
