import { AsyncStateModel } from '@shared/models';

import { InstitutionDepartmentsJsonApi, InstitutionSearchFilter, InstitutionSummaryMetrics } from '../models';

export interface InstitutionsAdminModel {
  departments: AsyncStateModel<InstitutionDepartmentsJsonApi>;
  summaryMetrics: AsyncStateModel<InstitutionSummaryMetrics>;
  hasOsfAddonSearch: AsyncStateModel<InstitutionSearchFilter[]>;
  storageRegionSearch: AsyncStateModel<InstitutionSearchFilter[]>;
  searchResults: AsyncStateModel<InstitutionSearchFilter[]>;
  selectedInstitutionId: string | null;
  currentSearchPropertyPath: string | null;
}
