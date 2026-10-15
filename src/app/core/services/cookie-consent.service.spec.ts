import { CookieService } from 'ngx-cookie-service';
import { MockProvider } from 'ng-mocks';

import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CookieServiceMock, CookieServiceMockType } from '@testing/providers/cookie-service.mock';

import { CookieConsentService } from './cookie-consent.service';

describe('CookieConsentService', () => {
  let service: CookieConsentService;
  let cookieServiceMock: CookieServiceMockType;

  function setup(isBrowser = true) {
    cookieServiceMock = CookieServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        CookieConsentService,
        MockProvider(CookieService, cookieServiceMock),
        MockProvider(PLATFORM_ID, isBrowser ? 'browser' : 'server'),
      ],
    });

    service = TestBed.inject(CookieConsentService);
  }

  it('should report consent when the cookie exists', () => {
    setup();
    cookieServiceMock.check.mockReturnValue(true);

    expect(service.hasConsent()).toBe(true);
    expect(cookieServiceMock.check).toHaveBeenCalledWith('cookie-consent');
  });

  it('should report no consent when the cookie is missing', () => {
    setup();

    expect(service.hasConsent()).toBe(false);
    expect(cookieServiceMock.check).toHaveBeenCalledWith('cookie-consent');
  });

  it('should report no consent outside the browser', () => {
    setup(false);
    cookieServiceMock.check.mockReturnValue(true);

    expect(service.hasConsent()).toBe(false);
    expect(cookieServiceMock.check).not.toHaveBeenCalled();
  });

  it('should store consent until year 9999', () => {
    setup();

    service.accept();

    expect(cookieServiceMock.set).toHaveBeenCalledWith('cookie-consent', 'true', new Date('9999-12-31T23:59:59Z'), '/');
  });

  it('should not store consent outside the browser', () => {
    setup(false);

    service.accept();

    expect(cookieServiceMock.set).not.toHaveBeenCalled();
  });
});
