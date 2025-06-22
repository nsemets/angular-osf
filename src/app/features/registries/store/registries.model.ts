import { AsyncStateModel } from '@osf/shared/models';

import { Project, Provider } from '../models';

export interface RegistriesStateModel {
  providers: AsyncStateModel<Provider[]>;
  currentProviderId: string | null;
  projects: AsyncStateModel<Project[]>;
}
