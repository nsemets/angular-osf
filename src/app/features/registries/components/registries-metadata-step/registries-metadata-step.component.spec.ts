import { MockComponents, MockModule, ngMocks } from 'ng-mocks';

import { TextareaModule } from 'primeng/textarea';

import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { TextInputComponent } from '@osf/shared/components/text-input/text-input.component';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { ContributorsSelectors } from '@osf/shared/stores/contributors';
import { SubjectsSelectors } from '@osf/shared/stores/subjects';

import { RegistriesSelectors } from '../../store';

import { RegistriesAffiliatedInstitutionComponent } from './registries-affiliated-institution/registries-affiliated-institution.component';
import { RegistriesContributorsComponent } from './registries-contributors/registries-contributors.component';
import { RegistriesLicenseComponent } from './registries-license/registries-license.component';
import { RegistriesSubjectsComponent } from './registries-subjects/registries-subjects.component';
import { RegistriesTagsComponent } from './registries-tags/registries-tags.component';
import { RegistriesMetadataStepComponent } from './registries-metadata-step.component';

import { MOCK_DRAFT_REGISTRATION } from '@testing/mocks/draft-registration.mock';
import { OSFTestingModule } from '@testing/osf.testing.module';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder } from '@testing/providers/router-provider.mock';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('RegistriesMetadataStepComponent', () => {
  ngMocks.faster();

  let component: RegistriesMetadataStepComponent;
  let fixture: ComponentFixture<RegistriesMetadataStepComponent>;
  let mockRouter: ReturnType<RouterMockBuilder['build']>;
  let customConfirmationService: jest.Mocked<CustomConfirmationService>;
  let actionsMock: {
    updateDraft: jest.Mock;
    updateStepState: jest.Mock;
    deleteDraft: jest.Mock;
    clearState: jest.Mock;
  };

  const mockDraft = { ...MOCK_DRAFT_REGISTRATION, title: 'Test Title', description: 'Test Description' };

  beforeEach(async () => {
    const mockActivatedRoute = ActivatedRouteMockBuilder.create().withParams({ id: 'draft-1' }).build();
    mockRouter = RouterMockBuilder.create().withUrl('/registries/osf/draft/draft-1/metadata').build();
    customConfirmationService = { confirmDelete: jest.fn() } as unknown as jest.Mocked<CustomConfirmationService>;

    await TestBed.configureTestingModule({
      imports: [
        RegistriesMetadataStepComponent,
        OSFTestingModule,
        MockModule(TextareaModule),
        ...MockComponents(
          TextInputComponent,
          RegistriesContributorsComponent,
          RegistriesSubjectsComponent,
          RegistriesTagsComponent,
          RegistriesLicenseComponent,
          RegistriesAffiliatedInstitutionComponent
        ),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: CustomConfirmationService, useValue: customConfirmationService },
        provideMockStore({
          signals: [
            { selector: RegistriesSelectors.getDraftRegistration, value: mockDraft },
            { selector: RegistriesSelectors.getStepsState, value: [{ invalid: false }] },
            { selector: RegistriesSelectors.hasDraftAdminAccess, value: true },
            { selector: ContributorsSelectors.getContributors, value: [] },
            { selector: SubjectsSelectors.getSelectedSubjects, value: [] },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistriesMetadataStepComponent);
    component = fixture.componentInstance;

    actionsMock = {
      updateDraft: jest.fn().mockReturnValue(of({})),
      updateStepState: jest.fn().mockReturnValue(of({})),
      deleteDraft: jest.fn().mockReturnValue(of({})),
      clearState: jest.fn().mockReturnValue(of({})),
    };
    Object.defineProperty(component, 'actions', { value: actionsMock, writable: true });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize metadataForm with required controls', () => {
    expect(component.metadataForm.get('title')).toBeTruthy();
    expect(component.metadataForm.get('description')).toBeTruthy();
    expect(component.metadataForm.get('contributors')).toBeTruthy();
    expect(component.metadataForm.get('subjects')).toBeTruthy();
    expect(component.metadataForm.get('tags')).toBeTruthy();
    expect(component.metadataForm.get('license.id')).toBeTruthy();
  });

  it('should have form invalid when title is empty', () => {
    component.metadataForm.patchValue({ title: '', description: 'Valid' });
    expect(component.metadataForm.get('title')?.valid).toBe(false);
  });

  it('should submit metadata and navigate to step 1', () => {
    component.metadataForm.patchValue({ title: 'New Title', description: 'New Desc' });
    const navigateSpy = mockRouter.navigate as jest.Mock;

    component.submitMetadata();

    expect(actionsMock.updateDraft).toHaveBeenCalledWith('draft-1', {
      title: 'New Title',
      description: 'New Desc',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['../1'], expect.objectContaining({ onSameUrlNavigation: 'reload' }));
  });

  it('should trim title and description on submit', () => {
    component.metadataForm.patchValue({ title: '  Padded Title  ', description: '  Padded Desc  ' });

    component.submitMetadata();

    expect(actionsMock.updateDraft).toHaveBeenCalledWith('draft-1', {
      title: 'Padded Title',
      description: 'Padded Desc',
    });
  });

  it('should call confirmDelete when deleteDraft is called', () => {
    component.deleteDraft();
    expect(customConfirmationService.confirmDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        headerKey: 'registries.deleteDraft',
        messageKey: 'registries.confirmDeleteDraft',
      })
    );
  });

  it('should set isDraftDeleted and navigate on deleteDraft confirm', () => {
    customConfirmationService.confirmDelete.mockImplementation(({ onConfirm }) => onConfirm());
    const navigateByUrlSpy = mockRouter.navigateByUrl as jest.Mock;

    component.deleteDraft();

    expect(component.isDraftDeleted).toBe(true);
    expect(actionsMock.deleteDraft).toHaveBeenCalledWith('draft-1');
    expect(actionsMock.clearState).toHaveBeenCalled();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/registries/osf/new');
  });

  it('should skip updates on destroy when isDraftDeleted is true', () => {
    component.isDraftDeleted = true;
    component.ngOnDestroy();

    expect(actionsMock.updateStepState).not.toHaveBeenCalled();
    expect(actionsMock.updateDraft).not.toHaveBeenCalled();
  });

  it('should update step state on destroy when fields are unchanged', () => {
    component.metadataForm.patchValue({ title: 'Test Title', description: 'Test Description' });
    component.ngOnDestroy();

    expect(actionsMock.updateStepState).toHaveBeenCalledWith('0', expect.any(Boolean), true);
    expect(actionsMock.updateDraft).not.toHaveBeenCalled();
  });

  it('should dispatch updateDraft on destroy when fields have changed', () => {
    component.metadataForm.patchValue({ title: 'Changed Title', description: 'Test Description' });
    component.ngOnDestroy();

    expect(actionsMock.updateStepState).toHaveBeenCalledWith('0', expect.any(Boolean), true);
    expect(actionsMock.updateDraft).toHaveBeenCalledWith(
      'draft-1',
      expect.objectContaining({ title: 'Changed Title' })
    );
  });
});
