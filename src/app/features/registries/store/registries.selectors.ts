import { Selector } from '@ngxs/store';

import { Project, Provider } from '../models';

import { RegistriesStateModel } from './registries.model';
import { RegistriesState } from './registries.state';

export class RegistriesSelectors {
  @Selector([RegistriesState])
  static getProviders(state: RegistriesStateModel): Provider[] {
    return state.providers.data;
  }

  @Selector([RegistriesState])
  static getProjects(state: RegistriesStateModel): Project[] {
    return state.projects.data;
  }

  @Selector([RegistriesState])
  static isDraftSubmitting(state: RegistriesStateModel): boolean {
    return state.registrations.isSubmitting ?? false;
  }
}
