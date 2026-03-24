import { CookieService } from 'ngx-cookie-service';
import { MockComponent, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from '@osf/shared/components/icon/icon.component';

import { CookieConsentBannerComponent } from './cookie-consent-banner.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('Component: Cookie Consent Banner', () => {
  let fixture: ComponentFixture<CookieConsentBannerComponent>;
  let component: CookieConsentBannerComponent;

  const cookieServiceMock = {
    check: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CookieConsentBannerComponent, MockComponent(IconComponent)],
      providers: [provideOSFCore(), MockProvider(CookieService, cookieServiceMock)],
    });
  });

  it('should show the banner if cookie is not set', () => {
    cookieServiceMock.check.mockReturnValue(false);
    fixture = TestBed.createComponent(CookieConsentBannerComponent);
    component = fixture.componentInstance;

    expect(component.displayBanner()).toBe(true);
  });

  it('should hide the banner if cookie is set', () => {
    cookieServiceMock.check.mockReturnValue(true);
    fixture = TestBed.createComponent(CookieConsentBannerComponent);
    component = fixture.componentInstance;

    expect(component.displayBanner()).toBe(false);
  });

  it('should set cookie and hide banner on acceptCookies()', () => {
    cookieServiceMock.check.mockReturnValue(false);
    fixture = TestBed.createComponent(CookieConsentBannerComponent);
    component = fixture.componentInstance;

    component.acceptCookies();

    expect(cookieServiceMock.set).toHaveBeenCalledWith('cookie-consent', 'true', new Date('9999-12-31T23:59:59Z'), '/');

    expect(component.displayBanner()).toBe(false);
  });
});
