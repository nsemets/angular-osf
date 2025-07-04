import { AsyncStateModel } from '@shared/models';

import { InstitutionDepartmentsJsonApi, InstitutionSearchFilter, InstitutionSummaryMetricsJsonApi } from '../models';

export interface InstitutionsAdminModel {
  departments: AsyncStateModel<InstitutionDepartmentsJsonApi>;
  summaryMetrics: AsyncStateModel<InstitutionSummaryMetricsJsonApi>;
  hasOsfAddonSearch: AsyncStateModel<InstitutionSearchFilter[]>;
  storageRegionSearch: AsyncStateModel<InstitutionSearchFilter[]>;
  searchResults: AsyncStateModel<InstitutionSearchFilter[]>;
  selectedInstitutionId: string | null;
  currentSearchPropertyPath: string | null;
}
