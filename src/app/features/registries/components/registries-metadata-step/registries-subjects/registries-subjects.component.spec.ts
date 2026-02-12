import { MockComponent } from 'ng-mocks';

import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { RegistriesSelectors } from '@osf/features/registries/store';
import { SubjectsComponent } from '@osf/shared/components/subjects/subjects.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { SubjectsSelectors } from '@osf/shared/stores/subjects';
import { SubjectModel } from '@shared/models/subject/subject.model';

import { RegistriesSubjectsComponent } from './registries-subjects.component';

import { MOCK_DRAFT_REGISTRATION } from '@testing/mocks/draft-registration.mock';
import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('RegistriesSubjectsComponent', () => {
  let component: RegistriesSubjectsComponent;
  let fixture: ComponentFixture<RegistriesSubjectsComponent>;
  let actionsMock: {
    fetchSubjects: jest.Mock;
    fetchSelectedSubjects: jest.Mock;
    fetchChildrenSubjects: jest.Mock;
    updateResourceSubjects: jest.Mock;
  };

  const mockSubjects: SubjectModel[] = [
    { id: 'sub-1', name: 'Subject 1' },
    { id: 'sub-2', name: 'Subject 2' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistriesSubjectsComponent, OSFTestingModule, MockComponent(SubjectsComponent)],
      providers: [
        provideMockStore({
          signals: [
            { selector: SubjectsSelectors.getSelectedSubjects, value: [] },
            { selector: SubjectsSelectors.areSelectedSubjectsLoading, value: false },
            { selector: RegistriesSelectors.getDraftRegistration, value: MOCK_DRAFT_REGISTRATION },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistriesSubjectsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl(null, Validators.required));
    fixture.componentRef.setInput('draftId', 'draft-1');

    actionsMock = {
      fetchSubjects: jest.fn().mockReturnValue(of({})),
      fetchSelectedSubjects: jest.fn().mockReturnValue(of({})),
      fetchChildrenSubjects: jest.fn().mockReturnValue(of({})),
      updateResourceSubjects: jest.fn().mockReturnValue(of({})),
    };
    Object.defineProperty(component, 'actions', { value: actionsMock });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchChildrenSubjects when getSubjectChildren is called', () => {
    component.getSubjectChildren('parent-1');
    expect(actionsMock.fetchChildrenSubjects).toHaveBeenCalledWith('parent-1');
  });

  it('should call fetchSubjects with search term when searchSubjects is called', () => {
    component.searchSubjects('biology');
    expect(actionsMock.fetchSubjects).toHaveBeenCalledWith(
      ResourceType.Registration,
      MOCK_DRAFT_REGISTRATION.providerId,
      'biology'
    );
  });

  it('should call updateResourceSubjects and update control when updateSelectedSubjects is called', () => {
    component.updateSelectedSubjects(mockSubjects);
    expect(actionsMock.updateResourceSubjects).toHaveBeenCalledWith(
      'draft-1',
      ResourceType.DraftRegistration,
      mockSubjects
    );
    expect(component.control().value).toEqual(mockSubjects);
    expect(component.control().touched).toBe(true);
    expect(component.control().dirty).toBe(true);
  });

  it('should mark control as touched and dirty on focusout', () => {
    component.onFocusOut();
    expect(component.control().touched).toBe(true);
    expect(component.control().dirty).toBe(true);
  });

  it('should set control value and mark as touched/dirty in updateControlState', () => {
    component.updateControlState(mockSubjects);
    expect(component.control().value).toEqual(mockSubjects);
    expect(component.control().touched).toBe(true);
    expect(component.control().dirty).toBe(true);
  });

  it('should have invalid control when value is null and touched', () => {
    component.control().markAsTouched();
    component.control().updateValueAndValidity();
    expect(component.control().valid).toBe(false);
    expect(component.control().errors?.['required']).toBeTruthy();
  });

  it('should have valid control when subjects are set', () => {
    component.updateControlState(mockSubjects);
    expect(component.control().valid).toBe(true);
    expect(component.control().errors).toBeNull();
  });
});
