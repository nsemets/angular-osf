import { MockProvider } from 'ng-mocks';

import { BehaviorSubject } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IS_XSMALL } from '@osf/shared/utils';
import { TranslateServiceMock } from '@shared/mocks';

import { MyProfileSearchComponent } from './my-profile-search.component';

describe('MyProfileSearchComponent', () => {
  let component: MyProfileSearchComponent;
  let fixture: ComponentFixture<MyProfileSearchComponent>;
  let isMobileSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    isMobileSubject = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      imports: [MyProfileSearchComponent],
      providers: [MockProvider(IS_XSMALL, isMobileSubject), TranslateServiceMock],
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfileSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
