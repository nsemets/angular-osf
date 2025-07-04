import { provideStates } from '@ngxs/store';

import { Routes } from '@angular/router';

import { InstitutionsSummaryComponent } from '@osf/features/institutions/pages/admin/pages';
import { InstitutionsAdminState } from '@osf/features/institutions/store';

export const routes: Routes = [
  {
    path: '',
    component: InstitutionsSummaryComponent,
    providers: [provideStates([InstitutionsAdminState])],
  },
];
