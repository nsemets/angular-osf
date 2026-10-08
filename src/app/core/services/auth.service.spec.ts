import { CookieService } from 'ngx-cookie-service';
import { MockProvider } from 'ng-mocks';

import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { WINDOW } from '@core/provider/window.provider';
import { JsonApiService } from '@osf/shared/services/json-api.service';
import { LoaderService } from '@osf/shared/services/loader.service';

import { CookieServiceMock } from '@testing/providers/cookie-service.mock';
import { JsonApiServiceMock } from '@testing/providers/json-api.service.mock';
import { LoaderServiceMock } from '@testing/providers/loader-service.mock';
import { provideMockStore } from '@testing/providers/store-provider.mock';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  const webUrl = 'https://web.test';
  const casUrl = 'https://cas.test';
  const origin = 'https://osf.test';

  let service: AuthService;
  let loaderService: LoaderServiceMock;
  let locationMock: { href: string; pathname: string; origin: string };

  function setup(overrides: { pathname?: string; href?: string; isBrowser?: boolean } = {}) {
    const pathname = overrides.pathname ?? '/dashboard';
    locationMock = {
      href: overrides.href ?? `${origin}${pathname}`,
      pathname,
      origin,
    };

    loaderService = new LoaderServiceMock();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideMockStore(),
        MockProvider(JsonApiService, JsonApiServiceMock.simple()),
        MockProvider(CookieService, CookieServiceMock.simple()),
        MockProvider(LoaderService, loaderService),
        MockProvider(WINDOW, { location: locationMock } as Window),
        MockProvider(ENVIRONMENT, { webUrl, casUrl, apiDomainUrl: 'https://api.test' }),
        MockProvider(PLATFORM_ID, overrides.isBrowser === false ? 'server' : 'browser'),
      ],
    });

    service = TestBed.inject(AuthService);
  }

  function nextFromServiceParam(href: string): string | null {
    const serviceParam = new URL(href).searchParams.get('service');
    return serviceParam ? new URL(serviceParam).searchParams.get('next') : null;
  }

  it('should use the current page as next when signing in from a regular page', () => {
    const href = `${origin}/project/abc`;
    setup({ pathname: '/project/abc', href });

    service.navigateToSignIn();

    expect(loaderService.show).toHaveBeenCalled();
    expect(nextFromServiceParam(locationMock.href)).toBe(href);
  });

  it('should use home as next when signing in from reset password', () => {
    setup({
      pathname: '/resetpassword/user-1/token-1',
      href: `${origin}/resetpassword/user-1/token-1`,
    });

    service.navigateToSignIn();

    expect(nextFromServiceParam(locationMock.href)).toBe(`${webUrl}/`);
  });

  it('should use home as next when signing in from forgot password with orcid', () => {
    setup({ pathname: '/forgotpassword', href: `${origin}/forgotpassword` });

    service.navigateToOrcidSignIn();

    expect(new URL(locationMock.href).searchParams.get('next')).toBe(`${webUrl}/`);
  });

  it('should use home as next when signing in from register with institution', () => {
    setup({ pathname: '/register', href: `${origin}/register` });

    service.navigateToInstitutionSignIn();

    expect(new URL(locationMock.href).searchParams.get('next')).toBe(`${webUrl}/`);
  });

  it('should not redirect to sign in when not in the browser', () => {
    setup({ isBrowser: false, href: `${origin}/dashboard` });

    service.navigateToSignIn();

    expect(loaderService.show).not.toHaveBeenCalled();
    expect(locationMock.href).toBe(`${origin}/dashboard`);
  });
});
