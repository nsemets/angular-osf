import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponse } from '@osf/core/models';
import { JsonApiService } from '@osf/core/services';

import { AnalyticsMetricsMapper, RelatedCountsMapper } from '../mappers';
import { AnalyticsMetricsGetResponse, AnalyticsMetricsModel, RelatedCountsGetResponse } from '../models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationAnalyticsService {
  private readonly jsonApiService = inject(JsonApiService);

  getMetrics(projectId: string, dateRange: string): Observable<AnalyticsMetricsModel> {
    const baseUrl = `${environment.apiDomainUrl}/_/metrics/query/node_analytics`;

    return this.jsonApiService
      .get<JsonApiResponse<AnalyticsMetricsGetResponse, null>>(`${baseUrl}/${projectId}/${dateRange}`)
      .pipe(map((response) => AnalyticsMetricsMapper.fromResponse(response.data)));
  }

  getRelatedCounts(projectId: string) {
    const url = `${environment.apiUrl}/registrations/${projectId}/?related_counts=true`;

    return this.jsonApiService
      .get<RelatedCountsGetResponse>(url)
      .pipe(map((response) => RelatedCountsMapper.fromResponse(response)));
  }
}
