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
        path: 'map',
        loadComponent: () =>
          import('./features/citizen/citizen-map.page').then((m) => m.CitizenMapComponent),
      },
      {
        path: 'incidents',
        loadComponent: () =>
          import('./features/citizen/citizen-reports.page').then((m) => m.CitizenReportsComponent),
      },
      {
        path: 'incidents/:id',
        loadComponent: () =>
          import('./features/citizen/incident-detail.page').then((m) => m.IncidentDetailComponent),
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
        path: 'escalation-rules',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./features/admin/escalation-rules-management.page').then(
            (m) => m.EscalationRulesManagementPage
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
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
    ],
  },
  {
    path: 'citizen',
    canActivate: [roleGuard(['Citizen'])],
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
    path: 'staff',
    // canActivate: [roleGuard(['Staff'])], // Tạm thời vô hiệu hóa để phát triển UI
    loadComponent: () =>
      import('./shared/layout/staff-layout.component').then((m) => m.StaffLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/staff/staff-home.page').then((m) => m.StaffHomeComponent),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/staff/staff-map.page').then((m) => m.StaffMapComponent),
      },
      {
        path: 'incidents',
        loadComponent: () =>
          import('./features/staff/staff-incidents.page').then((m) => m.StaffIncidentsComponent),
      },
      {
        path: 'incidents/:id',
        loadComponent: () =>
          import('./features/staff/staff-incident-detail.page').then((m) => m.StaffIncidentDetailComponent),
      },
    ],
  },
  {
    path: 'staff-manager',
    loadComponent: () =>
      import('./shared/layout/staff-manager-layout.component').then((m) => m.StaffManagerLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/staff-manager/staff-manager-home.page').then((m) => m.StaffManagerHomeComponent),
      },
      {
        path: 'map',
        loadComponent: () =>

          import('./features/staff-manager/staff-manager-map.page').then((m) => m.DepartmentManagerMapComponent),

      },
      {
        path: 'incidents',
        loadComponent: () =>
          import('./features/staff-manager/staff-manager-incidents.page').then((m) => m.StaffManagerIncidentsComponent),
      },
      {
        path: 'incidents/:id',
        loadComponent: () =>
          import('./features/staff-manager/staff-manager-incident-detail.page').then((m) => m.StaffManagerIncidentDetailComponent),
      },
      {
        path: 'sla-alert',
        loadComponent: () =>
          import('./features/staff-manager/staff-manager-sla-alert.page').then((m) => m.StaffManagerSlaAlertComponent),
      },
      {
        path: 'staffs',
        loadComponent: () =>
          import('./features/staff-manager/staff-manager-staffs.page').then((m) => m.StaffManagerStaffsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/staff-manager/staff-manager-profile.page').then((m) => m.StaffManagerProfileComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
]
