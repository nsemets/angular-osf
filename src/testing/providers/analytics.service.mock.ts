import { of } from 'rxjs';

import { AnalyticsService } from '@osf/shared/services/analytics.service';

import { Mocked } from 'vitest';

export function AnalyticsServiceMockFactory() {
  return {
    sendCountedUsage: vi.fn().mockReturnValue(of(void 0)),
    sendCountedUsageForRegistrationAndProjects: vi.fn(),
  } as unknown as Mocked<AnalyticsService>;
}
