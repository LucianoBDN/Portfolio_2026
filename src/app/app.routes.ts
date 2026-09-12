import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      {
        path: 'resumen',
        loadComponent: () =>
          import('./features/public/resumen/resumen').then((m) => m.Resumen),
      },
      {
        path: 'proyectos',
        loadComponent: () =>
          import('./features/public/proyectos-list/proyectos-list').then((m) => m.ProyectosList),
      },
      {
        path: 'proyectos/:slug',
        loadComponent: () =>
          import('./features/public/proyecto-detail/proyecto-detail').then(
            (m) => m.ProyectoDetail,
          ),
      },
      {
        path: 'experiencia',
        loadComponent: () =>
          import('./features/public/experiencia-page/experiencia-page').then(
            (m) => m.ExperienciaPage,
          ),
      },
      {
        path: 'certificaciones',
        loadComponent: () =>
          import('./features/public/certificaciones-page/certificaciones-page').then(
            (m) => m.CertificacionesPage,
          ),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./features/public/contacto-page/contacto-page').then((m) => m.ContactoPage),
      },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/admin/admin-profile/admin-profile').then(
            (m) => m.AdminProfile,
          ),
      },
      {
        path: 'technologies',
        loadComponent: () =>
          import('./features/admin/admin-technologies/admin-technologies').then(
            (m) => m.AdminTechnologies,
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/admin/admin-projects/admin-projects').then(
            (m) => m.AdminProjects,
          ),
      },
      {
        path: 'experience',
        loadComponent: () =>
          import('./features/admin/admin-experience/admin-experience').then(
            (m) => m.AdminExperience,
          ),
      },
      {
        path: 'education',
        loadComponent: () =>
          import('./features/admin/admin-education/admin-education').then(
            (m) => m.AdminEducation,
          ),
      },
      {
        path: 'hobbies',
        loadComponent: () =>
          import('./features/admin/admin-hobbies/admin-hobbies').then(
            (m) => m.AdminHobbies,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/admin/admin-messages/admin-messages').then(
            (m) => m.AdminMessages,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
