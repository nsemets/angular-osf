import {
  AsyncStateModel,
  DraftRegistrationModel,
  License,
  RegistrationCard,
  RegistrationModel,
  Resource,
} from '@shared/models';

import { PageSchema, Project, ProviderSchema } from '../models';

export interface RegistriesStateModel {
  providerSchemas: AsyncStateModel<ProviderSchema[]>;
  projects: AsyncStateModel<Project[]>;
  draftRegistration: AsyncStateModel<DraftRegistrationModel | null>;
  registration: AsyncStateModel<RegistrationModel | null>;
  registries: AsyncStateModel<Resource[]>;
  licenses: AsyncStateModel<License[]>;
  pagesSchema: AsyncStateModel<PageSchema[]>;
  stepsValidation: Record<string, { invalid: boolean }>;
  draftRegistrations: AsyncStateModel<RegistrationCard[]> & {
    totalCount: number;
  };
  submittedRegistrations: AsyncStateModel<RegistrationCard[]> & {
    totalCount: number;
  };
}
