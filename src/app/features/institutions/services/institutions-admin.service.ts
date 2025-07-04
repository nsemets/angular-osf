import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';

import {
  InstitutionDepartmentsJsonApi,
  InstitutionIndexCardFilter,
  InstitutionIndexValueSearchJsonApi,
  InstitutionSearchFilter,
  InstitutionSummaryMetricsJsonApi,
} from '../models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstitutionsAdminService {
  private jsonApiService = inject(JsonApiService);

  fetchDepartments(institutionId: string): Observable<InstitutionDepartmentsJsonApi> {
    return this.jsonApiService.get<InstitutionDepartmentsJsonApi>(
      `${environment.apiUrl}/institutions/${institutionId}/metrics/departments/`
    );
  }

  fetchSummary(institutionId: string): Observable<InstitutionSummaryMetricsJsonApi> {
    return this.jsonApiService.get<InstitutionSummaryMetricsJsonApi>(
      `${environment.apiUrl}/institutions/${institutionId}/metrics/summary/`
    );
  }

  fetchIndexValueSearch(
    institutionId: string,
    valueSearchPropertyPath: string,
    additionalParams?: Record<string, string>
  ): Observable<InstitutionSearchFilter[]> {
    const params: Record<string, string> = {
      'cardSearchFilter[affiliation]': `https://ror.org/05d5mza29,https://test.osf.io/institutions/${institutionId}/`,
      valueSearchPropertyPath,
      'page[size]': '10',
      ...additionalParams,
    };

    return this.jsonApiService
      .get<InstitutionIndexValueSearchJsonApi>(`${environment.shareDomainUrl}/index-value-search`, params)
      .pipe(
        map((response) => {
          if (response?.included) {
            return response.included
              .filter((item): item is InstitutionIndexCardFilter => item.type === 'index-card')
              .map((item) => ({
                id: item.id,
                label: item.attributes?.resourceMetadata?.displayLabel?.[0]?.['@value'] || item.id,
                value: item.attributes?.resourceMetadata?.['@id'] || item.id,
              }));
          }
          return [];
        })
      );
  }
}
