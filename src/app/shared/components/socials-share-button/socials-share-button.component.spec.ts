import { TranslatePipe } from '@ngx-translate/core';
import { MockComponent, MockPipe, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialShareService } from '@osf/shared/services';

import { IconComponent } from '../icon/icon.component';

import { SocialsShareButtonComponent } from './socials-share-button.component';

describe.skip('SocialsShareButtonComponent', () => {
  let component: SocialsShareButtonComponent;
  let fixture: ComponentFixture<SocialsShareButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialsShareButtonComponent, MockComponent(IconComponent), MockPipe(TranslatePipe)],
      providers: [MockProvider(SocialShareService)],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialsShareButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
