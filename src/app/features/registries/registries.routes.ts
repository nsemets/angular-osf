import { provideStates } from '@ngxs/store';

import { Routes } from '@angular/router';

import { RegistriesComponent } from '@osf/features/registries/registries.component';
import { RegistriesState } from '@osf/features/registries/store';
import { RegistrationViewOnlyLinksService } from '@osf/shared/services/registration-view-only-links.service';
import { ContributorsState, SubjectsState, ViewOnlyLinkState } from '@osf/shared/stores';
import { ANALYTICS_SERVICE, CONTRIBUTORS_SERVICE, VIEW_ONLY_LINKS_SERVICE } from '@osf/shared/tokens';
import { SUBJECTS_SERVICE } from '@osf/shared/tokens/subjects.token';

import { ModerationState } from '../moderation/store';
import { RegistrationAnalyticsService } from '../project/analytics/services';
import { AnalyticsState } from '../project/analytics/store';

import {
  LicensesHandlers,
  ProjectsHandlers,
  ProvidersHandlers,
  RegistrationContributorsHandlers,
  SubjectsHandlers,
} from './store/handlers';
import { LicensesService, RegistrationContributorsService, RegistrationSubjectsService } from './services';

export const registriesRoutes: Routes = [
  {
    path: '',
    component: RegistriesComponent,
    providers: [
      provideStates([RegistriesState, ContributorsState, SubjectsState]),
      ProvidersHandlers,
      ProjectsHandlers,
      LicensesHandlers,
      RegistrationContributorsHandlers,
      SubjectsHandlers,
      RegistrationSubjectsService,
      RegistrationContributorsService,
      LicensesService,
      {
        provide: SUBJECTS_SERVICE,
        useClass: RegistrationSubjectsService,
      },
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () => import('@osf/features/registries/pages').then((c) => c.RegistriesLandingComponent),
      },
      {
        path: 'moderation',
        loadComponent: () =>
          import('@osf/features/moderation/pages/registries-moderation/registries-moderation.component').then(
            (m) => m.RegistriesModerationComponent
          ),
        providers: [provideStates([ModerationState])],
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/new-registration/new-registration.component').then(
            (mod) => mod.NewRegistrationComponent
          ),
      },
      {
        path: 'drafts',
        loadComponent: () => import('./components/drafts/drafts.component').then((mod) => mod.DraftsComponent),
        children: [
          {
            path: ':id/metadata',
            loadComponent: () =>
              import('./components/metadata/metadata.component').then((mod) => mod.MetadataComponent),
          },
          {
            path: ':id/review',
            loadComponent: () => import('./components/review/review.component').then((mod) => mod.ReviewComponent),
          },
          {
            path: ':id/:step',
            loadComponent: () =>
              import('./components/custom-step/custom-step.component').then((mod) => mod.CustomStepComponent),
          },
        ],
      },
      {
        path: ':id',
        children: [
          {
            path: 'contributors',
            loadComponent: () =>
              import('../project/contributors/contributors.component').then((mod) => mod.ContributorsComponent),
            providers: [
              provideStates([ContributorsState, ViewOnlyLinkState]),
              {
                provide: CONTRIBUTORS_SERVICE,
                useClass: RegistrationContributorsService,
              },
              {
                provide: VIEW_ONLY_LINKS_SERVICE,
                useClass: RegistrationViewOnlyLinksService,
              },
            ],
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('../project/analytics/analytics.component').then((mod) => mod.AnalyticsComponent),
            providers: [
              provideStates([AnalyticsState]),
              {
                provide: ANALYTICS_SERVICE,
                useClass: RegistrationAnalyticsService,
              },
            ],
          },
        ],
      },
    ],
  },
];
