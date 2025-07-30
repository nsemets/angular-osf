import { AsyncStateModel } from '@shared/models';

import { RegistryComponentModel } from '../../models';

export interface RegistryComponentsStateModel {
  registryComponents: AsyncStateModel<RegistryComponentModel[]> & {
    meta?: { total: number; per_page: number };
  };
}
