import { ResourceType } from '@osf/shared/enums/resource-type.enum';

import { DateRange } from '../enums';

export class GetMetrics {
  static readonly type = '[Analytics] Get Metrics';

  constructor(
    public resourceId: string,
    public dateRange: DateRange
  ) {}
}

export class GetRelatedCounts {
  static readonly type = '[Analytics] Get Related Counts';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType | undefined
  ) {}
}

export class ClearAnalytics {
  static readonly type = '[Analytics] Clear Analytics';
}
