import { InjectionToken } from '@angular/core';

import { IContributorsService } from '@osf/shared/models';

export const CONTRIBUTORS_SERVICE = new InjectionToken<IContributorsService>('CONTRIBUTORS_SERVICE');
