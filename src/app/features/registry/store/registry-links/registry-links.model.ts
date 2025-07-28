import { InstitutionUsersLinksJsonApi } from '@osf/features/admin-institutions/models';
import { AsyncStateModel } from '@shared/models';

import { LinkedNode, LinkedRegistration } from '../../models';

export interface RegistryLinksStateModel {
  linkedNodes: AsyncStateModel<LinkedNode[]> & {
    meta?: { total: number; per_page: number };
    links?: InstitutionUsersLinksJsonApi;
  };
  linkedRegistrations: AsyncStateModel<LinkedRegistration[]> & {
    meta?: { total: number; per_page: number };
    links?: InstitutionUsersLinksJsonApi;
  };
}
