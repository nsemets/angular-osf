import { provideStates } from '@ngxs/store';

import { Routes } from '@angular/router';

import { AdminInstitutionsComponent } from '@osf/features/institutions/pages/admin/admin-institutions.component';
import { InstitutionsPreprintsComponent } from '@osf/features/institutions/pages/admin/pages/institutions-preprints/institutions-preprints.component';
import { InstitutionsProjectsComponent } from '@osf/features/institutions/pages/admin/pages/institutions-projects/institutions-projects.component';
import { InstitutionsRegistrationsComponent } from '@osf/features/institutions/pages/admin/pages/institutions-registrations/institutions-registrations.component';
import { InstitutionsSummaryComponent } from '@osf/features/institutions/pages/admin/pages/institutions-summary/institutions-summary.component';
import { InstitutionsUsersComponent } from '@osf/features/institutions/pages/admin/pages/institutions-users/institutions-users.component';
import { InstitutionsAdminState } from '@osf/features/institutions/store';

export const routes: Routes = [
  {
    path: '',
    component: AdminInstitutionsComponent,
    providers: [provideStates([InstitutionsAdminState])],
    children: [
      {
        path: '',
        redirectTo: 'summary',
        pathMatch: 'full',
      },
      {
        path: 'summary',
        component: InstitutionsSummaryComponent,
      },
      {
        path: 'users',
        component: InstitutionsUsersComponent,
      },
      {
        path: 'projects',
        component: InstitutionsProjectsComponent,
      },
      {
        path: 'registrations',
        component: InstitutionsRegistrationsComponent,
      },
      {
        path: 'preprints',
        component: InstitutionsPreprintsComponent,
      },
    ],
  },
];
