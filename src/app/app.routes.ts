import { provideStates } from '@ngxs/store';

import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { isFileGuard } from '@core/guards/is-file.guard';
import { redirectIfLoggedInGuard } from '@core/guards/redirect-if-logged-in.guard';

import { isProjectGuard } from './core/guards/is-project.guard';
import { isRegistryGuard } from './core/guards/is-registry.guard';
import { MyPreprintsState } from './features/preprints/store/my-preprints';
import { ProfileState } from './features/profile/store';
import { RegistriesState } from './features/registries/store';
import { LicensesHandlers, ProjectsHandlers, ProvidersHandlers } from './features/registries/store/handlers';
import { FilesHandlers } from './features/registries/store/handlers/files.handlers';
import { LicensesService } from './shared/services/licenses.service';
import { BookmarksState } from './shared/stores/bookmarks';
import { ProjectsState } from './shared/stores/projects';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/components/layout/layout.component').then((mod) => mod.LayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [redirectIfLoggedInGuard],
        loadComponent: () => import('@osf/features/home/home.component').then((mod) => mod.HomeComponent),
        data: { skipBreadcrumbs: true },
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/home/pages/dashboard/dashboard.component').then((mod) => mod.DashboardComponent),
        data: { skipBreadcrumbs: true },
        canActivate: [authGuard],
        providers: [provideStates([ProjectsState])],
      },
      {
        path: 'register',
        canActivate: [redirectIfLoggedInGuard],
        loadComponent: () =>
          import('./features/auth/pages/sign-up/sign-up.component').then((mod) => mod.SignUpComponent),
        data: { skipBreadcrumbs: true },
      },
      {
        path: 'forgotpassword',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password.component').then(
            (mod) => mod.ForgotPasswordComponent
          ),
        data: { skipBreadcrumbs: true },
      },
      {
        path: 'resetpassword/:userId/:token',
        loadComponent: () =>
          import('./features/auth/pages/reset-password/reset-password.component').then(
            (mod) => mod.ResetPasswordComponent
          ),
        data: { skipBreadcrumbs: true },
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then((mod) => mod.SearchComponent),
      },
      {
        path: 'my-projects',
        loadComponent: () =>
          import('./features/my-projects/my-projects.component').then((mod) => mod.MyProjectsComponent),
        providers: [provideStates([BookmarksState, ProjectsState])],
        canActivate: [authGuard],
      },
      {
        path: 'my-registrations',
        canActivate: [authGuard],
        loadComponent: () => import('@osf/features/registries/pages').then((c) => c.MyRegistrationsComponent),
        providers: [
          provideStates([RegistriesState]),
          ProvidersHandlers,
          ProjectsHandlers,
          LicensesService,
          LicensesHandlers,
          FilesHandlers,
        ],
      },
      {
        path: 'my-preprints',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@osf/features/preprints/pages/my-preprints/my-preprints.component').then(
            (m) => m.MyPreprintsComponent
          ),
        providers: [provideStates([MyPreprintsState])],
      },
      {
        path: 'preprints',
        loadChildren: () => import('./features/preprints/preprints.routes').then((mod) => mod.preprintsRoutes),
      },
      {
        path: 'preprints/:providerId/:id',
        loadComponent: () =>
          import('@osf/features/preprints/pages/preprint-details/preprint-details.component').then(
            (c) => c.PreprintDetailsComponent
          ),
      },
      {
        path: 'registries',
        loadChildren: () => import('./features/registries/registries.routes').then((mod) => mod.registriesRoutes),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((mod) => mod.ProfileComponent),
        providers: [provideStates([ProfileState])],
        data: { scrollToTop: false },
        canActivate: [authGuard],
      },
      {
        path: 'user/:id',
        loadComponent: () => import('./features/profile/profile.component').then((mod) => mod.ProfileComponent),
        providers: [provideStates([ProfileState])],
      },
      {
        path: 'institutions',
        loadChildren: () => import('./features/institutions/institutions.routes').then((r) => r.routes),
      },
      {
        path: 'collections',
        loadChildren: () => import('./features/collections/collections.routes').then((mod) => mod.collectionsRoutes),
      },
      {
        path: 'meetings',
        loadChildren: () => import('./features/meetings/meetings.routes').then((mod) => mod.meetingsRoutes),
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then((mod) => mod.settingsRoutes),
        canActivate: [authGuard],
      },
      {
        path: 'terms-of-use',
        loadComponent: () =>
          import('./features/static/terms-of-use/terms-of-use.component').then((mod) => mod.TermsOfUseComponent),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./features/static/privacy-policy/privacy-policy.component').then((mod) => mod.PrivacyPolicyComponent),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./core/components/forbidden-page/forbidden-page.component').then((mod) => mod.ForbiddenPageComponent),
        data: { skipBreadcrumbs: true },
      },
      {
        path: 'request-access/:id',
        loadComponent: () =>
          import('./core/components/request-access/request-access.component').then((mod) => mod.RequestAccessComponent),
        data: { skipBreadcrumbs: true },
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./core/components/page-not-found/page-not-found.component').then((mod) => mod.PageNotFoundComponent),
        data: { skipBreadcrumbs: true },
      },
      {
        path: ':id/files/:provider/:fileId',
        loadComponent: () =>
          import('./features/files/pages/file-redirect/file-redirect.component').then((m) => m.FileRedirectComponent),
      },
      {
        path: 'project/:id/files/:provider/:fileId',
        loadComponent: () =>
          import('./features/files/pages/file-redirect/file-redirect.component').then((m) => m.FileRedirectComponent),
      },
      {
        path: 'project/:id/node/:nodeId/files/:provider/:fileId',
        loadComponent: () =>
          import('./features/files/pages/file-redirect/file-redirect.component').then((m) => m.FileRedirectComponent),
      },
      {
        path: ':id',
        canMatch: [isFileGuard],
        loadChildren: () => import('./features/files/files.routes').then((m) => m.filesRoutes),
      },
      {
        path: ':id',
        canMatch: [isProjectGuard],
        loadChildren: () => import('./features/project/project.routes').then((m) => m.projectRoutes),
        providers: [provideStates([ProjectsState, BookmarksState])],
      },
      {
        path: ':id',
        canMatch: [isRegistryGuard],
        loadChildren: () => import('./features/registry/registry.routes').then((m) => m.registryRoutes),
        providers: [provideStates([BookmarksState])],
      },
      {
        path: '**',
        loadComponent: () =>
          import('./core/components/page-not-found/page-not-found.component').then((mod) => mod.PageNotFoundComponent),
        data: { skipBreadcrumbs: true },
      },
    ],
  },
];
