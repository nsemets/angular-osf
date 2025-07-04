import { InjectionToken } from '@angular/core';

import { IAnalyticsService } from '@osf/shared/models';

export const ANALYTICS_SERVICE = new InjectionToken<IAnalyticsService>('ANALYTICS_SERVICE');
