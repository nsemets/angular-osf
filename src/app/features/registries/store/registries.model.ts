import { AsyncStateModel } from '@osf/shared/models';

export interface Provider {
  id: string;
  title: string;
}

export interface RegistriesStateModel {
  providers: AsyncStateModel<Provider[]>;
  currentProviderId: string | null;
}
