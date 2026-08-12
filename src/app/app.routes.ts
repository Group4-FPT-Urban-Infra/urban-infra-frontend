import { Routes } from '@angular/router'
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guard'
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
    canActivate: [authGuard],
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
        loadComponent: () =>
          import('./features/create-incident/create-incident.page').then(
            (m) => m.CreateIncidentPage
          ),
      },
      {
        path: 'resolution-workflow',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'sla-escalation',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'reports-analytics',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'admin',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/user-management.page').then((m) => m.UserManagementPage),
      },
      {
        path: 'departments',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/department-management.page').then(
            (m) => m.DepartmentManagementPage
          ),
      },
      {
        path: 'slas',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/slas-management.page').then(
            (m) => m.SlasManagementPage
          ),
      },
      {
        path: 'incident-categories',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/incident-category-management.page').then(
            (m) => m.IncidentCategoryManagementPage
          ),
      },
      {
        path: 'areas',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/area-management.page').then(
            (m) => m.AreaManagementPage
          ),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
]
