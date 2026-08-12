import { Routes } from '@angular/router'
import { authGuard, guestGuard } from './core/auth/auth.guard'
import { AppLayoutComponent } from './shared/layout/app-layout'

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'public-map',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'incident-reporting',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/create-incident/create-incident.page').then(
            (m) => m.CreateIncidentPage
          ),
      },
      {
        path: 'resolution-workflow',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'sla-escalation',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'reports-analytics',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'admin',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
    ],
  },
  {
    path: 'citizen',
    loadComponent: () =>
      import('./shared/layout/citizen-layout.component').then((m) => m.CitizenLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/citizen/citizen-home.page').then((m) => m.CitizenHomeComponent),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/citizen/citizen-map.page').then((m) => m.CitizenMapComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/citizen/citizen-reports.page').then((m) => m.CitizenReportsComponent),
      },
      {
        path: 'reports/:id',
        loadComponent: () =>
          import('./features/citizen/incident-detail.page').then((m) => m.IncidentDetailComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
]
