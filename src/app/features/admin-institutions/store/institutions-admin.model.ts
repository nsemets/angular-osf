import { AsyncStateModel, AsyncStateWithLinksModel, AsyncStateWithTotalCount } from '@shared/models';

import {
  InstitutionDepartment,
  InstitutionProject,
  InstitutionRegistration,
  InstitutionSearchFilter,
  InstitutionSummaryMetrics,
  InstitutionUser,
  SendMessageResponseJsonApi,
} from '../models';

export interface InstitutionsAdminModel {
  departments: AsyncStateModel<InstitutionDepartment[]>;
  summaryMetrics: AsyncStateModel<InstitutionSummaryMetrics>;
  hasOsfAddonSearch: AsyncStateModel<InstitutionSearchFilter[]>;
  storageRegionSearch: AsyncStateModel<InstitutionSearchFilter[]>;
  searchResults: AsyncStateModel<InstitutionSearchFilter[]>;
  users: AsyncStateWithTotalCount<InstitutionUser[]>;
  projects: AsyncStateWithLinksModel<InstitutionProject[]>;
  registrations: AsyncStateWithLinksModel<InstitutionRegistration[]>;
  sendMessage: AsyncStateModel<SendMessageResponseJsonApi | null>;
  selectedInstitutionId: string | null;
  currentSearchPropertyPath: string | null;
}
