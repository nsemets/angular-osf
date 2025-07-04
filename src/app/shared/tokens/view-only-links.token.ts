import { InjectionToken } from '@angular/core';

import { IViewOnlyLinksService } from '@osf/shared/models';

export const VIEW_ONLY_LINKS_SERVICE = new InjectionToken<IViewOnlyLinksService>('VIEW_ONLY_LINKS_SERVICE');
