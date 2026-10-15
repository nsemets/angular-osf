import { CookieService } from 'ngx-cookie-service';

import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly cookies = inject(CookieService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cookieName = 'cookie-consent';

  hasConsent(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    return this.cookies.check(this.cookieName);
  }

  accept(): void {
    if (!this.isBrowser) {
      return;
    }

    this.cookies.set(this.cookieName, 'true', new Date('9999-12-31T23:59:59Z'), '/');
  }
}
