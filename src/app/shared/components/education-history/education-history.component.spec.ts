import { MockPipe } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthYearPipe } from '@osf/shared/pipes/month-year.pipe';

import { EducationHistoryComponent } from './education-history.component';

import { MOCK_EDUCATION } from '@testing/mocks/user-employment-education.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

describe('EducationHistoryComponent', () => {
  let component: EducationHistoryComponent;
  let fixture: ComponentFixture<EducationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationHistoryComponent, MockPipe(MonthYearPipe)],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(EducationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept education input', () => {
    const educationData = [MOCK_EDUCATION];
    fixture.componentRef.setInput('education', educationData);
    fixture.detectChanges();

    expect(component.education()).toEqual(educationData);
  });
});
