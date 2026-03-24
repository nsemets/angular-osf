import { MockProvider } from 'ng-mocks';

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ViewOnlyLinkMessageComponent } from './view-only-link-message.component';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';

describe('ViewOnlyLinkMessageComponent', () => {
  let component: ViewOnlyLinkMessageComponent;
  let fixture: ComponentFixture<ViewOnlyLinkMessageComponent>;
  let routerMock: RouterMockType;

  function setup(platformId: 'browser' | 'server', navigateMock?: jest.Mock<Promise<boolean>>) {
    routerMock = navigateMock
      ? RouterMockBuilder.create().withNavigate(navigateMock).build()
      : RouterMockBuilder.create().build();

    TestBed.configureTestingModule({
      imports: [ViewOnlyLinkMessageComponent],
      providers: [provideOSFCore(), MockProvider(Router, routerMock), MockProvider(PLATFORM_ID, platformId)],
    });

    fixture = TestBed.createComponent(ViewOnlyLinkMessageComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup('server');
    expect(component).toBeTruthy();
  });

  it('should not navigate outside browser platform', () => {
    setup('server');

    component.handleLeaveViewOnlyView();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should navigate in browser platform', () => {
    const navigateMock = jest.fn<Promise<boolean>, [unknown[], unknown?]>(() => new Promise<boolean>(() => {}));
    setup('browser', navigateMock);

    component.handleLeaveViewOnlyView();

    expect(navigateMock).toHaveBeenCalledWith([], {
      queryParams: { view_only: null },
      queryParamsHandling: 'merge',
    });
  });
});
