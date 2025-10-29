import { Action, State, StateContext } from '@ngxs/store';

import { catchError, EMPTY, forkJoin, Observable, of, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { getResourceTypeStringFromEnum } from '@osf/shared/helpers/get-resource-types.helper';
import { GlobalSearchService } from '@osf/shared/services/global-search.service';
import { FilterOperator } from '@shared/models/search/discaverable-filter.model';
import { ResourcesData } from '@shared/models/search/resource.model';

import {
  ClearFilterSearchResults,
  FetchResources,
  FetchResourcesByLink,
  LoadFilterOptions,
  LoadFilterOptionsAndSetValues,
  LoadFilterOptionsWithSearch,
  LoadMoreFilterOptions,
  ResetSearchState,
  SetDefaultFilterValue,
  SetResourceType,
  SetSearchText,
  SetSortBy,
  UpdateSelectedFilterOption,
} from './global-search.actions';
import { GLOBAL_SEARCH_STATE_DEFAULTS, GlobalSearchStateModel } from './global-search.model';

@State<GlobalSearchStateModel>({
  name: 'globalSearch',
  defaults: GLOBAL_SEARCH_STATE_DEFAULTS,
})
@Injectable()
export class GlobalSearchState {
  private searchService = inject(GlobalSearchService);
  private readonly environment = inject(ENVIRONMENT);

  @Action(FetchResources)
  fetchResources(ctx: StateContext<GlobalSearchStateModel>): Observable<ResourcesData> {
    const state = ctx.getState();

    ctx.patchState({ resources: { ...state.resources, isLoading: true } });

    return this.searchService
      .getResources(this.buildParamsForIndexCardSearch(state))
      .pipe(tap((response) => this.updateResourcesState(ctx, response)));
  }

  @Action(FetchResourcesByLink)
  fetchResourcesByLink(ctx: StateContext<GlobalSearchStateModel>, action: FetchResourcesByLink) {
    if (!action.link) return EMPTY;
    ctx.patchState({ resources: { ...ctx.getState().resources, isLoading: true } });

    return this.searchService
      .getResourcesByLink(action.link)
      .pipe(tap((response) => this.updateResourcesState(ctx, response)));
  }

  @Action(LoadFilterOptions)
  loadFilterOptions(ctx: StateContext<GlobalSearchStateModel>, action: LoadFilterOptions) {
    const state = ctx.getState();
    const filterKey = action.filterKey;
    const cachedOptions = state.filterOptionsCache[filterKey];
    if (cachedOptions?.length) {
      const updatedFilters = state.filters.map((f) =>
        f.key === filterKey ? { ...f, options: cachedOptions, isLoaded: true, isLoading: false } : f
      );
      ctx.patchState({ filters: updatedFilters });
      return EMPTY;
    }

    const loadingFilters = state.filters.map((f) => (f.key === filterKey ? { ...f, isLoading: true } : f));
    ctx.patchState({ filters: loadingFilters });

    return this.searchService.getFilterOptions(this.buildParamsForIndexValueSearch(state, filterKey)).pipe(
      tap((response) => {
        const options = response.options;
        const updatedCache = { ...ctx.getState().filterOptionsCache, [filterKey]: options };
        const updatedPaginationCache = { ...ctx.getState().filterPaginationCache };

        if (response.nextUrl) {
          updatedPaginationCache[filterKey] = response.nextUrl;
        } else {
          delete updatedPaginationCache[filterKey];
        }

        const updatedFilters = ctx
          .getState()
          .filters.map((f) => (f.key === filterKey ? { ...f, options, isLoaded: true, isLoading: false } : f));

        ctx.patchState({
          filters: updatedFilters,
          filterOptionsCache: updatedCache,
          filterPaginationCache: updatedPaginationCache,
        });
      }),
      catchError(() => of({ options: [], nextUrl: undefined }))
    );
  }

  @Action(LoadMoreFilterOptions)
  loadMoreFilterOptions(ctx: StateContext<GlobalSearchStateModel>, action: LoadMoreFilterOptions) {
    const state = ctx.getState();
    const filterKey = action.filterKey;

    const nextUrl = state.filterPaginationCache[filterKey];

    if (!nextUrl) {
      return;
    }

    const loadingFilters = state.filters.map((f) => (f.key === filterKey ? { ...f, isPaginationLoading: true } : f));
    ctx.patchState({ filters: loadingFilters });

    return this.searchService.getFilterOptionsFromPaginationUrl(nextUrl).pipe(
      tap((response) => {
        const currentOptions = ctx.getState().filterSearchCache[filterKey] || [];
        const updatedSearchCache = {
          ...ctx.getState().filterSearchCache,
          [filterKey]: [...currentOptions, ...response.options],
        };
        const updatedPaginationCache = { ...ctx.getState().filterPaginationCache };

        if (response.nextUrl) {
          updatedPaginationCache[filterKey] = response.nextUrl;
        } else {
          delete updatedPaginationCache[filterKey];
        }

        const updatedFilters = ctx
          .getState()
          .filters.map((f) => (f.key === filterKey ? { ...f, isPaginationLoading: false } : f));

        ctx.patchState({
          filters: updatedFilters,
          filterSearchCache: updatedSearchCache,
          filterPaginationCache: updatedPaginationCache,
        });
      })
    );
  }

  @Action(LoadFilterOptionsWithSearch)
  loadFilterOptionsWithSearch(ctx: StateContext<GlobalSearchStateModel>, action: LoadFilterOptionsWithSearch) {
    const state = ctx.getState();
    const filterKey = action.filterKey;
    const loadingFilters = state.filters.map((f) => (f.key === filterKey ? { ...f, isSearchLoading: true } : f));
    ctx.patchState({ filters: loadingFilters });
    return this.searchService
      .getFilterOptions(this.buildParamsForIndexValueSearch(state, filterKey, action.searchText))
      .pipe(
        tap((response) => {
          const updatedSearchCache = { ...ctx.getState().filterSearchCache, [filterKey]: response.options };
          const updatedPaginationCache = { ...ctx.getState().filterPaginationCache };

          if (response.nextUrl) {
            updatedPaginationCache[filterKey] = response.nextUrl;
          } else {
            delete updatedPaginationCache[filterKey];
          }

          const updatedFilters = ctx
            .getState()
            .filters.map((f) => (f.key === filterKey ? { ...f, isSearchLoading: false } : f));

          ctx.patchState({
            filters: updatedFilters,
            filterSearchCache: updatedSearchCache,
            filterPaginationCache: updatedPaginationCache,
          });
        })
      );
  }

  @Action(ClearFilterSearchResults)
  clearFilterSearchResults(ctx: StateContext<GlobalSearchStateModel>, action: ClearFilterSearchResults) {
    const state = ctx.getState();
    const filterKey = action.filterKey;
    const updatedSearchCache = { ...state.filterSearchCache };
    delete updatedSearchCache[filterKey];

    const updatedFilters = state.filters.map((f) => (f.key === filterKey ? { ...f, isSearchLoading: false } : f));

    ctx.patchState({
      filterSearchCache: updatedSearchCache,
      filters: updatedFilters,
    });
  }

  @Action(LoadFilterOptionsAndSetValues)
  loadFilterOptionsAndSetValues(ctx: StateContext<GlobalSearchStateModel>, action: LoadFilterOptionsAndSetValues) {
    const filterValues = action.filterValues;
    const filterKeys = Object.keys(filterValues).filter((key) => filterValues[key]);
    if (!filterKeys.length) return;

    const loadingFilters = ctx
      .getState()
      .filters.map((f) =>
        filterKeys.includes(f.key) && !ctx.getState().filterOptionsCache[f.key]?.length ? { ...f, isLoading: true } : f
      );
    ctx.patchState({ filters: loadingFilters });
    ctx.patchState({ selectedFilterOptions: filterValues });

    const observables = filterKeys.map((key) =>
      this.searchService.getFilterOptions(this.buildParamsForIndexValueSearch(ctx.getState(), key)).pipe(
        tap((response) => {
          const options = response.options;
          const updatedCache = { ...ctx.getState().filterOptionsCache, [key]: options };
          const updatedPaginationCache = { ...ctx.getState().filterPaginationCache };

          if (response.nextUrl) {
            updatedPaginationCache[key] = response.nextUrl;
          } else {
            delete updatedPaginationCache[key];
          }

          const updatedFilters = ctx
            .getState()
            .filters.map((f) => (f.key === key ? { ...f, options, isLoaded: true, isLoading: false } : f));

          ctx.patchState({
            filters: updatedFilters,
            filterOptionsCache: updatedCache,
            filterPaginationCache: updatedPaginationCache,
          });
        }),
        catchError(() => of({ options: [], nextUrl: undefined }))
      )
    );

    return forkJoin(observables);
  }

  @Action(SetDefaultFilterValue)
  setDefaultFilterValue(ctx: StateContext<GlobalSearchStateModel>, action: SetDefaultFilterValue) {
    const updatedFilterValues = { ...ctx.getState().defaultFilterOptions, [action.filterKey]: action.value };
    ctx.patchState({ defaultFilterOptions: updatedFilterValues });
  }

  @Action(UpdateSelectedFilterOption)
  updateSelectedFilterOption(ctx: StateContext<GlobalSearchStateModel>, action: UpdateSelectedFilterOption) {
    const updatedFilterValues = { ...ctx.getState().selectedFilterOptions, [action.filterKey]: action.filterOption };
    ctx.patchState({ selectedFilterOptions: updatedFilterValues });
  }

  @Action(SetSortBy)
  setSortBy(ctx: StateContext<GlobalSearchStateModel>, action: SetSortBy) {
    ctx.patchState({ sortBy: action.sortBy });
  }

  @Action(SetSearchText)
  setSearchText(ctx: StateContext<GlobalSearchStateModel>, action: SetSearchText) {
    ctx.patchState({ searchText: action.searchText });
  }

  @Action(SetResourceType)
  setResourceType(ctx: StateContext<GlobalSearchStateModel>, action: SetResourceType) {
    ctx.patchState({ resourceType: action.type });
    ctx.patchState({ selectedFilterOptions: {} });
  }

  @Action(ResetSearchState)
  resetSearchState(ctx: StateContext<GlobalSearchStateModel>) {
    ctx.setState({
      ...GLOBAL_SEARCH_STATE_DEFAULTS,
    });
  }

  private updateResourcesState(ctx: StateContext<GlobalSearchStateModel>, response: ResourcesData) {
    ctx.patchState({
      resources: { data: response.resources, isLoading: false, error: null },
      filterOptionsCache: {},
      filterSearchCache: {},
      filterPaginationCache: {},
      filters: response.filters,
      resourcesCount: response.count,
      first: response.first,
      next: response.next,
      previous: response.previous,
    });
  }

  private buildParamsForIndexValueSearch(
    state: GlobalSearchStateModel,
    filterKey: string,
    valueSearchText?: string
  ): Record<string, string | string[]> {
    return {
      ...this.buildParamsForIndexCardSearch(state),
      'page[size]': '200',
      valueSearchPropertyPath: filterKey,
      valueSearchText: valueSearchText ?? '',
    };
  }

  private buildParamsForIndexCardSearch(state: GlobalSearchStateModel): Record<string, string | string[]> {
    const filtersParams: Record<string, string | string[]> = {};
    Object.entries(state.defaultFilterOptions).forEach(([key, value]) => {
      filtersParams[`cardSearchFilter[${key}][]`] = value;
    });
    Object.entries(state.selectedFilterOptions).forEach(([key, options]) => {
      const filter = state.filters.find((f) => f.key === key);

      const firstOptionValue = options[0]?.value;
      const isOptionValueBoolean = firstOptionValue === 'true' || firstOptionValue === 'false';
      if (filter?.operator === FilterOperator.IsPresent || isOptionValueBoolean) {
        if (firstOptionValue) {
          filtersParams[`cardSearchFilter[${key}][is-present]`] = firstOptionValue;
        }
      } else {
        filtersParams[`cardSearchFilter[${key}][]`] = options.map((option) => option.value);
      }
    });

    filtersParams['cardSearchFilter[resourceType]'] = getResourceTypeStringFromEnum(state.resourceType);
    filtersParams['cardSearchFilter[accessService]'] = `${this.environment.webUrl}/`;
    filtersParams['cardSearchText[*,creator.name,isContainedBy.creator.name]'] = state.searchText ?? '';
    filtersParams['page[size]'] = '10';

    const sortBy = state.sortBy;
    const sortParam =
      sortBy.toLowerCase().includes('count') && !sortBy.includes('relevance') ? 'sort[integer-value]' : 'sort';
    filtersParams[sortParam] = sortBy;

    return filtersParams;
  }
}
