import { createDispatchMap, select } from '@ngxs/store';

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  FetchHasOsfAddonSearch,
  FetchInstitutionDepartments,
  FetchInstitutionSummaryMetrics,
  FetchStorageRegionSearch,
  InstitutionsAdminSelectors,
  SetSelectedInstitutionId,
} from '../../../../store';

@Component({
  selector: 'osf-institutions-summary',
  imports: [],
  templateUrl: './institutions-summary.component.html',
  styleUrl: './institutions-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstitutionsSummaryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  departments = select(InstitutionsAdminSelectors.getDepartments);
  departmentsLoading = select(InstitutionsAdminSelectors.getDepartmentsLoading);
  departmentsError = select(InstitutionsAdminSelectors.getDepartmentsError);

  summaryMetrics = select(InstitutionsAdminSelectors.getSummaryMetrics);
  summaryMetricsLoading = select(InstitutionsAdminSelectors.getSummaryMetricsLoading);
  summaryMetricsError = select(InstitutionsAdminSelectors.getSummaryMetricsError);

  hasOsfAddonSearch = select(InstitutionsAdminSelectors.getHasOsfAddonSearch);
  hasOsfAddonSearchLoading = select(InstitutionsAdminSelectors.getHasOsfAddonSearchLoading);
  hasOsfAddonSearchError = select(InstitutionsAdminSelectors.getHasOsfAddonSearchError);

  storageRegionSearch = select(InstitutionsAdminSelectors.getStorageRegionSearch);
  storageRegionSearchLoading = select(InstitutionsAdminSelectors.getStorageRegionSearchLoading);
  storageRegionSearchError = select(InstitutionsAdminSelectors.getStorageRegionSearchError);

  selectedInstitutionId = select(InstitutionsAdminSelectors.getSelectedInstitutionId);

  private readonly actions = createDispatchMap({
    fetchDepartments: FetchInstitutionDepartments,
    fetchSummaryMetrics: FetchInstitutionSummaryMetrics,
    fetchHasOsfAddonSearch: FetchHasOsfAddonSearch,
    fetchStorageRegionSearch: FetchStorageRegionSearch,
    setSelectedInstitutionId: SetSelectedInstitutionId,
  });

  ngOnInit(): void {
    const institutionId = this.route.snapshot.params['institution-id'];

    if (institutionId) {
      this.actions.setSelectedInstitutionId(institutionId);
      this.actions.fetchDepartments(institutionId);
      this.actions.fetchSummaryMetrics(institutionId);
      this.actions.fetchHasOsfAddonSearch(institutionId);
      this.actions.fetchStorageRegionSearch(institutionId);
    }
  }
}
