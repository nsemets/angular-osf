import { Button } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { Select } from 'primeng/select';

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { SEARCH_TAB_OPTIONS, searchSortingOptions } from '@shared/constants';
import { ResourceTab } from '@shared/enums';
import { Resource } from '@shared/models';
import { IS_WEB, IS_XSMALL } from '@shared/utils';

import { ResourceCardComponent } from '../resource-card/resource-card.component';

@Component({
  selector: 'osf-search-results-container',
  imports: [FormsModule, NgOptimizedImage, Button, DataView, Select, ResourceCardComponent],
  templateUrl: './search-results-container.component.html',
  styleUrl: './search-results-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SearchResultsContainerComponent {
  resources = input<Resource[]>([]);
  searchCount = input<number>(0);
  selectedSort = input<string>('');
  selectedTab = input<ResourceTab>(ResourceTab.All);
  selectedValues = input<Record<string, string | null>>({});
  first = input<string | null>(null);
  prev = input<string | null>(null);
  next = input<string | null>(null);
  isFiltersOpen = input<boolean>(false);
  isSortingOpen = input<boolean>(false);

  sortChanged = output<string>();
  tabChanged = output<ResourceTab>();
  pageChanged = output<string>();
  filtersToggled = output<void>();
  sortingToggled = output<void>();

  protected readonly searchSortingOptions = searchSortingOptions;
  protected readonly ResourceTab = ResourceTab;

  protected readonly isMobile = toSignal(inject(IS_XSMALL));
  protected readonly isWeb = toSignal(inject(IS_WEB));

  protected readonly tabsOptions = SEARCH_TAB_OPTIONS;

  protected readonly hasSelectedValues = computed(() => {
    const values = this.selectedValues();
    return Object.values(values).some((value) => value !== null && value !== '');
  });

  protected readonly hasFilters = computed(() => {
    return true;
  });

  selectSort(value: string): void {
    this.sortChanged.emit(value);
  }

  selectTab(value: ResourceTab): void {
    this.tabChanged.emit(value);
  }

  switchPage(link: string | null): void {
    if (link != null) {
      this.pageChanged.emit(link);
    }
  }

  openFilters(): void {
    this.filtersToggled.emit();
  }

  openSorting(): void {
    this.sortingToggled.emit();
  }

  isAnyFilterOptions(): boolean {
    return this.hasFilters();
  }
}
