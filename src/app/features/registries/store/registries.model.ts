import { ContributorModel } from '@osf/shared/components/contributors/models';
import { AsyncStateModel } from '@osf/shared/models';

import { Project, Provider } from '../models';
import { Registration } from '../models/registries.model';

export interface RegistriesStateModel {
  providers: AsyncStateModel<Provider[]>;
  projects: AsyncStateModel<Project[]>;
  draftRegistration: AsyncStateModel<Registration | null>;
  contributorsList: AsyncStateModel<ContributorModel[]>;
}
