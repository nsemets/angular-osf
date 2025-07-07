import { Action, State, StateContext } from '@ngxs/store';

import { catchError, tap, throwError } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import {
  InstitutionDepartmentsJsonApi,
  InstitutionSearchFilter,
  InstitutionSummaryMetrics,
  InstitutionSummaryMetricsJsonApi,
} from '../models';
import { InstitutionsAdminService } from '../services/institutions-admin.service';

import {
  FetchHasOsfAddonSearch,
  FetchInstitutionDepartments,
  FetchInstitutionSearchResults,
  FetchInstitutionSummaryMetrics,
  FetchStorageRegionSearch,
} from './institutions-admin.actions';
import { InstitutionsAdminModel } from './institutions-admin.model';

const createEmptyDepartments = (): InstitutionDepartmentsJsonApi => ({
  data: [],
});

const createEmptySummaryMetrics = (): InstitutionSummaryMetricsJsonApi => ({
  data: {
    id: '',
    type: 'institution-summary-metrics',
    attributes: {
      report_yearmonth: '',
      user_count: 0,
      public_project_count: 0,
      private_project_count: 0,
      public_registration_count: 0,
      embargoed_registration_count: 0,
      published_preprint_count: 0,
      public_file_count: 0,
      storage_byte_count: 0,
      monthly_logged_in_user_count: 0,
      monthly_active_user_count: 0,
    },
    relationships: {
      user: {
        data: null,
      },
      institution: {
        links: {
          related: {
            href: '',
            meta: {},
          },
        },
        data: {
          id: '',
          type: 'institutions',
        },
      },
    },
    links: {},
  },
  meta: {
    version: '',
  },
});

const createEmptySearchFilters = (): InstitutionSearchFilter[] => [];

@State<InstitutionsAdminModel>({
  name: 'institutionsAdmin',
  defaults: {
    departments: { data: createEmptyDepartments(), isLoading: false, error: null },
    summaryMetrics: { data: {} as InstitutionSummaryMetrics, isLoading: false, error: null },
    hasOsfAddonSearch: { data: createEmptySearchFilters(), isLoading: false, error: null },
    storageRegionSearch: { data: createEmptySearchFilters(), isLoading: false, error: null },
    searchResults: { data: createEmptySearchFilters(), isLoading: false, error: null },
    selectedInstitutionId: null,
    currentSearchPropertyPath: null,
  },
})
@Injectable()
export class InstitutionsAdminState {
  private readonly institutionsAdminService = inject(InstitutionsAdminService);

  @Action(FetchInstitutionDepartments)
  fetchDepartments(ctx: StateContext<InstitutionsAdminModel>, action: FetchInstitutionDepartments) {
    const state = ctx.getState();
    ctx.patchState({
      departments: { ...state.departments, isLoading: true, error: null },
    });

    return this.institutionsAdminService.fetchDepartments(action.institutionId).pipe(
      tap((response) => {
        ctx.patchState({
          departments: { data: response, isLoading: false, error: null },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          departments: {
            ...state.departments,
            isLoading: false,
            error: error.message,
          },
        });
        return throwError(() => error);
      })
    );
  }

  @Action(FetchInstitutionSummaryMetrics)
  fetchSummaryMetrics(ctx: StateContext<InstitutionsAdminModel>, action: FetchInstitutionSummaryMetrics) {
    const state = ctx.getState();
    ctx.patchState({
      summaryMetrics: { ...state.summaryMetrics, isLoading: true, error: null },
    });

    return this.institutionsAdminService.fetchSummary(action.institutionId).pipe(
      tap((response) => {
        ctx.patchState({
          summaryMetrics: { data: response, isLoading: false, error: null },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          summaryMetrics: {
            ...state.summaryMetrics,
            isLoading: false,
            error: error.message,
          },
        });
        return throwError(() => error);
      })
    );
  }

  @Action(FetchInstitutionSearchResults)
  fetchSearchResults(ctx: StateContext<InstitutionsAdminModel>, action: FetchInstitutionSearchResults) {
    const state = ctx.getState();
    ctx.patchState({
      searchResults: { ...state.searchResults, isLoading: true, error: null },
      currentSearchPropertyPath: action.valueSearchPropertyPath,
    });

    return this.institutionsAdminService
      .fetchIndexValueSearch(action.institutionId, action.valueSearchPropertyPath, action.additionalParams)
      .pipe(
        tap((response) => {
          ctx.patchState({
            searchResults: { data: response, isLoading: false, error: null },
          });
        }),
        catchError((error) => {
          ctx.patchState({
            searchResults: {
              ...state.searchResults,
              isLoading: false,
              error: error.message,
            },
          });
          return throwError(() => error);
        })
      );
  }

  @Action(FetchHasOsfAddonSearch)
  fetchHasOsfAddonSearch(ctx: StateContext<InstitutionsAdminModel>, action: FetchHasOsfAddonSearch) {
    const state = ctx.getState();
    ctx.patchState({
      hasOsfAddonSearch: { ...state.hasOsfAddonSearch, isLoading: true, error: null },
    });

    return this.institutionsAdminService.fetchIndexValueSearch(action.institutionId, 'hasOsfAddon').pipe(
      tap((response) => {
        ctx.patchState({
          hasOsfAddonSearch: { data: response, isLoading: false, error: null },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          hasOsfAddonSearch: {
            ...state.hasOsfAddonSearch,
            isLoading: false,
            error: error.message,
          },
        });
        return throwError(() => error);
      })
    );
  }

  @Action(FetchStorageRegionSearch)
  fetchStorageRegionSearch(ctx: StateContext<InstitutionsAdminModel>, action: FetchStorageRegionSearch) {
    const state = ctx.getState();
    ctx.patchState({
      storageRegionSearch: { ...state.storageRegionSearch, isLoading: true, error: null },
    });

    return this.institutionsAdminService.fetchIndexValueSearch(action.institutionId, 'storageRegion').pipe(
      tap((response) => {
        ctx.patchState({
          storageRegionSearch: { data: response, isLoading: false, error: null },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          storageRegionSearch: {
            ...state.storageRegionSearch,
            isLoading: false,
            error: error.message,
          },
        });
        return throwError(() => error);
      })
    );
  }
}
