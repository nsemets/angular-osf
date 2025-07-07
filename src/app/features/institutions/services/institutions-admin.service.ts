import { catchError, map, Observable, of } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';
import { mapInstitutionSummaryMetrics } from '@osf/features/institutions/mappers';
import { mapIndexCardResults } from '@osf/features/institutions/mappers/institution-summary-index.mapper';

import {
  InstitutionDepartmentsJsonApi,
  InstitutionIndexValueSearchJsonApi,
  InstitutionSearchFilter,
  InstitutionSummaryMetrics,
  InstitutionSummaryMetricsJsonApi,
} from '../models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstitutionsAdminService {
  hardcodedUrl = 'https://api.test.osf.io/v2';

  private jsonApiService = inject(JsonApiService);

  fetchDepartments(institutionId: string): Observable<InstitutionDepartmentsJsonApi> {
    return this.jsonApiService
      .get<InstitutionDepartmentsJsonApi>(`${this.hardcodedUrl}/institutions/${institutionId}/metrics/departments/`)
      .pipe(
        //todo: remove mock data
        catchError((err) => {
          console.warn('Departments API error, returning mock data:', err);
          return of({
            data: [
              {
                id: 'cos-N/A',
                type: 'institution-departments',
                attributes: {
                  name: 'N/A',
                  number_of_users: 159,
                },
                links: {
                  self: 'https://api.test.osf.io/v2/institutions/cos/metrics/departments/',
                },
              },
              {
                id: 'cos-',
                type: 'institution-departments',
                attributes: {
                  name: '',
                  number_of_users: 9,
                },
                links: {
                  self: 'https://api.test.osf.io/v2/institutions/cos/metrics/departments/',
                },
              },
              {
                id: 'cos-QA',
                type: 'institution-departments',
                attributes: {
                  name: 'QA',
                  number_of_users: 5,
                },
                links: {
                  self: 'https://api.test.osf.io/v2/institutions/cos/metrics/departments/',
                },
              },
            ],
            meta: {
              total: 3,
              per_page: 10,
              version: '2.20',
            },
            links: {
              self: 'https://api.test.osf.io/v2/institutions/cos/metrics/departments/',
              first: null,
              last: null,
              prev: null,
              next: null,
            },
          } as InstitutionDepartmentsJsonApi);
        })
      );
  }

  fetchSummary(institutionId: string): Observable<InstitutionSummaryMetrics> {
    return this.jsonApiService
      .get<InstitutionSummaryMetricsJsonApi>(`${this.hardcodedUrl}/institutions/${institutionId}/metrics/summary/`)
      .pipe(
        //todo: remove mock data
        catchError((err) => {
          console.warn('Summary API error, returning mock data:', err);
          return of({
            data: {
              id: 'cos',
              type: 'institution-summary-metrics',
              attributes: {
                report_yearmonth: '2025-06',
                user_count: 173,
                public_project_count: 174,
                private_project_count: 839,
                public_registration_count: 360,
                embargoed_registration_count: 76,
                published_preprint_count: 1464,
                public_file_count: 7088,
                storage_byte_count: 12365253682,
                monthly_logged_in_user_count: 14,
                monthly_active_user_count: 15,
              },
              relationships: {
                user: {
                  data: null,
                },
                institution: {
                  links: {
                    related: {
                      href: 'https://api.test.osf.io/v2/institutions/cos/',
                      meta: {},
                    },
                  },
                  data: {
                    id: 'cos',
                    type: 'institutions',
                  },
                },
              },
              links: {},
            },
            meta: {
              version: '2.20',
            },
          } as InstitutionSummaryMetricsJsonApi);
        }),
        map((result) => mapInstitutionSummaryMetrics(result.data.attributes))
      );
  }

  fetchIndexValueSearch(
    institutionId: string,
    valueSearchPropertyPath: string,
    additionalParams?: Record<string, string>
  ): Observable<InstitutionSearchFilter[]> {
    const params: Record<string, string> = {
      //todo: change here https://test.osf.io to current environment
      'cardSearchFilter[affiliation]': `https://ror.org/05d5mza29,https://test.osf.io/institutions/${institutionId}/`,
      valueSearchPropertyPath,
      'page[size]': '10',
      ...additionalParams,
    };

    return this.jsonApiService
      .get<InstitutionIndexValueSearchJsonApi>(`${environment.shareDomainUrl}/index-value-search`, params)
      .pipe(map((response) => mapIndexCardResults(response?.included)));
  }
}
