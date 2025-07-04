import { Observable } from 'rxjs';

import { AnalyticsMetricsModel, RelatedCountsModel } from '@osf/features/project/analytics/models';

export interface IAnalyticsService {
  getMetrics(projectId: string, dateRange: string): Observable<AnalyticsMetricsModel>;
  getRelatedCounts(projectId: string): Observable<RelatedCountsModel>;
}
