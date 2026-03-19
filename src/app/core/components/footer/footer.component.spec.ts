import { MockComponent, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { SOCIAL_ICONS } from '@core/constants/social-icons.constant';
import { IconComponent } from '@osf/shared/components/icon/icon.component';

import { FooterComponent } from './footer.component';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FooterComponent, MockComponent(IconComponent)],
      providers: [
        provideOSFCore(),
        provideRouter([]),
        MockProvider(ActivatedRoute, ActivatedRouteMockBuilder.create().build()),
      ],
    });

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose social icons from constants', () => {
    expect(component.socialIcons).toEqual(SOCIAL_ICONS);
  });
});
