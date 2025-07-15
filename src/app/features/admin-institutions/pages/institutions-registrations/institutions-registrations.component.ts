import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { parseQueryFilterParams } from '@core/helpers';
import { AdminTableComponent } from '@osf/features/admin-institutions/components';
import { registrationTableColumns } from '@osf/features/admin-institutions/constants';
import { mapRegistrationToTableData } from '@osf/features/admin-institutions/mappers/institution-registration-to-table-data.mapper';
import { InstitutionsAdminSelectors } from '@osf/features/admin-institutions/store';
import { SortOrder } from '@shared/enums';
import { QueryParams } from '@shared/models';
import { InstitutionsSearchSelectors } from '@shared/stores';

import { FetchRegistrations } from '../../store/institutions-admin.actions';

import { environment } from 'src/environments/environment';

interface RegistrationQueryParams {
  size?: number;
  sort?: string;
  cursor?: string;
}

@Component({
  selector: 'osf-institutions-registrations',
  imports: [CommonModule, AdminTableComponent, TranslatePipe],
  templateUrl: './institutions-registrations.component.html',
  styleUrl: './institutions-registrations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstitutionsRegistrationsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly actions = createDispatchMap({
    fetchRegistrations: FetchRegistrations,
  });

  institution = select(InstitutionsSearchSelectors.getInstitution);
  registrations = select(InstitutionsAdminSelectors.getRegistrations);
  totalCount = select(InstitutionsAdminSelectors.getRegistrationsTotalCount);
  isLoading = select(InstitutionsAdminSelectors.getRegistrationsLoading);
  registrationsLinks = select(InstitutionsAdminSelectors.getRegistrationsLinks);

  tableColumns = signal(registrationTableColumns);
  reportsLink = 'https://drive.google.com/drive/folders/1_aFmeJwLp5xBS3-8clZ4xA9L3UFxdzDd';

  currentPageSize = signal(10);
  currentSort = signal('-dateModified');
  currentCursor = signal('');

  private queryParams = signal<RegistrationQueryParams>({});

  tableData = computed(() => {
    const registrationsData = this.registrations();
    return registrationsData.map(mapRegistrationToTableData);
  });

  downloadLink = computed(() => {
    const institution = this.institution();
    const queryParams = this.queryParams();

    if (!institution?.iris?.length) {
      return '';
    }

    const institutionIris = institution.iris.join(',');
    const baseUrl = `${environment.shareDomainUrl}/index-card-search`;
    const params = new URLSearchParams({
      'cardSearchFilter[affiliation][]': institutionIris,
      'cardSearchFilter[resourceType]': 'Registration',
      'cardSearchFilter[accessService]': environment.webUrl,
      'page[size]': String(queryParams.size || this.currentPageSize()),
      sort: queryParams.sort || this.currentSort(),
    });

    if (queryParams.cursor) {
      params.append('page[cursor]', queryParams.cursor);
    }

    return `${baseUrl}?${params.toString()}`;
  });

  constructor() {
    this.setupQueryParamsEffect();
  }

  ngOnInit() {
    this.loadRegistrations();
  }

  onSortChange(params: QueryParams): void {
    this.updateQueryParams({
      sort:
        params.sortColumn && params.sortOrder
          ? params.sortOrder === SortOrder.Desc
            ? `-${params.sortColumn}`
            : params.sortColumn
          : undefined,
    });
  }

  onLinkPageChange(link: string): void {
    const url = new URL(link);
    const cursor = url.searchParams.get('page[cursor]') || '';
    this.updateQueryParams({ cursor });
  }

  private setupQueryParamsEffect(): void {
    effect(() => {
      this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
        const queryParams = parseQueryFilterParams(params);
        this.queryParams.set({
          size: queryParams.size,
          sort:
            queryParams.sortColumn && queryParams.sortOrder
              ? queryParams.sortOrder === SortOrder.Desc
                ? `-${queryParams.sortColumn}`
                : queryParams.sortColumn
              : undefined,
          cursor: params['cursor'] || '',
        });
        this.currentPageSize.set(queryParams.size || 10);
        this.currentSort.set(
          queryParams.sortColumn && queryParams.sortOrder
            ? queryParams.sortOrder === SortOrder.Desc
              ? `-${queryParams.sortColumn}`
              : queryParams.sortColumn
            : '-dateModified'
        );
        this.currentCursor.set(params['cursor'] || '');
      });
    });
  }

  private loadRegistrations(): void {
    const institution = this.institution();
    const institutionId = this.route.parent?.snapshot.params['institution-id'];

    if (!institutionId || !institution?.iris?.length) {
      return;
    }

    this.actions.fetchRegistrations(
      institutionId,
      institution.iris,
      this.currentPageSize(),
      this.currentSort(),
      this.currentCursor()
    );
  }

  private updateQueryParams(params: RegistrationQueryParams): void {
    const queryParams: Record<string, string | undefined> = {};

    if (params.sort) {
      queryParams['sort'] = params.sort;
    }
    if (params.cursor) {
      queryParams['cursor'] = params.cursor;
    }
    if (params.size) {
      queryParams['size'] = params.size.toString();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
