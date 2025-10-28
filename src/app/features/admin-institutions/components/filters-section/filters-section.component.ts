import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, model } from '@angular/core';

import { FilterChipsComponent } from '@osf/shared/components/filter-chips/filter-chips.component';
import { SearchFiltersComponent } from '@osf/shared/components/search-filters/search-filters.component';
import { DiscoverableFilter, FilterOption } from '@shared/models';
import {
  ClearFilterSearchResults,
  FetchResources,
  GlobalSearchSelectors,
  LoadFilterOptions,
  LoadFilterOptionsAndSetValues,
  LoadFilterOptionsWithSearch,
  LoadMoreFilterOptions,
  SetDefaultFilterValue,
  UpdateSelectedFilterOption,
} from '@shared/stores/global-search';

@Component({
  selector: 'osf-institution-resource-table-filters',
  imports: [Button, Card, FilterChipsComponent, TranslatePipe, SearchFiltersComponent],
  templateUrl: './filters-section.component.html',
  styleUrl: './filters-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersSectionComponent {
  private actions = createDispatchMap({
    loadFilterOptions: LoadFilterOptions,
    loadFilterOptionsAndSetValues: LoadFilterOptionsAndSetValues,
    loadFilterOptionsWithSearch: LoadFilterOptionsWithSearch,
    loadMoreFilterOptions: LoadMoreFilterOptions,
    updateSelectedFilterOption: UpdateSelectedFilterOption,
    clearFilterSearchResults: ClearFilterSearchResults,
    setDefaultFilterValue: SetDefaultFilterValue,
    fetchResources: FetchResources,
  });

  filtersVisible = model<boolean>();
  filters = select(GlobalSearchSelectors.getFilters);
  selectedFilterOptions = select(GlobalSearchSelectors.getSelectedOptions);
  filterSearchCache = select(GlobalSearchSelectors.getFilterSearchCache);
  areResourcesLoading = select(GlobalSearchSelectors.getResourcesLoading);

  onSelectedFilterOptionsChanged(event: { filter: DiscoverableFilter; filterOption: FilterOption[] }): void {
    this.actions.updateSelectedFilterOption(event.filter.key, event.filterOption);
    this.actions.fetchResources();
  }

  onLoadFilterOptions(filter: DiscoverableFilter): void {
    this.actions.loadFilterOptions(filter.key);
  }

  onLoadMoreFilterOptions(filter: DiscoverableFilter): void {
    this.actions.loadMoreFilterOptions(filter.key);
  }

  onSearchFilterOptions(event: { searchText: string; filter: DiscoverableFilter }): void {
    if (event.searchText.trim()) {
      this.actions.loadFilterOptionsWithSearch(event.filter.key, event.searchText);
    } else {
      this.actions.clearFilterSearchResults(event.filter.key);
    }
  }

  onFilterChipRemoved(event: { filterKey: string; optionRemoved: FilterOption }): void {
    const updatedOptions = this.selectedFilterOptions()[event.filterKey].filter(
      (option) => option.value === event.optionRemoved.value
    );
    this.actions.updateSelectedFilterOption(event.filterKey, updatedOptions);
    this.actions.fetchResources();
  }
}
