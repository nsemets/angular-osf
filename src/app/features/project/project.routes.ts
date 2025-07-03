import { provideStates } from '@ngxs/store';

import { Routes } from '@angular/router';

import { CONTRIBUTORS_SERVICE } from '@osf/shared/constants';
import { ProjectContributorsService } from '@osf/shared/services';
import { ContributorsState, ViewOnlyLinkState } from '@osf/shared/stores';

import { ProjectFilesState } from './files/store';
import { SettingsState } from './settings/store';

export const projectRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../project/project.component').then((mod) => mod.ProjectComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('../project/overview/project-overview.component').then((mod) => mod.ProjectOverviewComponent),
      },
      {
        path: 'metadata',
        loadChildren: () =>
          import('../project/metadata/project-metadata.routes').then((mod) => mod.projectMetadataRoutes),
      },
      {
        path: 'files',
        loadChildren: () => import('../project/files/project-files.routes').then((mod) => mod.projectFilesRoutes),
        providers: [provideStates([ProjectFilesState])],
      },
      {
        path: 'registrations',
        loadComponent: () =>
          import('../project/registrations/registrations.component').then((mod) => mod.RegistrationsComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('../project/settings/settings.component').then((mod) => mod.SettingsComponent),
        providers: [provideStates([SettingsState, ViewOnlyLinkState])],
      },
      {
        path: 'contributors',
        loadComponent: () =>
          import('../project/contributors/contributors.component').then((mod) => mod.ContributorsComponent),
        providers: [
          provideStates([ContributorsState, ViewOnlyLinkState]),
          {
            provide: CONTRIBUTORS_SERVICE,
            useClass: ProjectContributorsService,
          },
        ],
      },
      {
        path: 'analytics',
        loadComponent: () => import('../project/analytics/analytics.component').then((mod) => mod.AnalyticsComponent),
      },
      {
        path: 'wiki',
        loadComponent: () => import('../project/wiki/wiki.component').then((mod) => mod.WikiComponent),
      },
      {
        path: 'addons',
        loadChildren: () => import('../project/addons/addons.routes').then((mod) => mod.addonsRoutes),
      },
    ],
  },
];
