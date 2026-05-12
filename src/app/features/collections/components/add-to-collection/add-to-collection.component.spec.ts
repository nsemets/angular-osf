import { MockComponents, MockProvider } from 'ng-mocks';

import { Subject } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { CollectionMetadataStepComponent } from '@osf/features/collections/components/add-to-collection/collection-metadata-step/collection-metadata-step.component';
import { ProjectContributorsStepComponent } from '@osf/features/collections/components/add-to-collection/project-contributors-step/project-contributors-step.component';
import { ProjectMetadataStepComponent } from '@osf/features/collections/components/add-to-collection/project-metadata-step/project-metadata-step.component';
import { SelectProjectStepComponent } from '@osf/features/collections/components/add-to-collection/select-project-step/select-project-step.component';
import { AddToCollectionSteps } from '@osf/features/collections/enums';
import { RemoveFromCollectionDialogResult } from '@osf/features/collections/models/remove-from-collection-dialog-result.model';
import { AddToCollectionSelectors } from '@osf/features/collections/store/add-to-collection';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { CollectionSubmissionReviewState } from '@osf/shared/enums/collection-submission-review-state.enum';
import { CollectionProjectSubmission } from '@osf/shared/models/collections/collections.model';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { CollectionsSelectors } from '@shared/stores/collections';
import { ProjectsSelectors } from '@shared/stores/projects/projects.selectors';

import { MOCK_USER } from '@testing/mocks/data.mock';
import { MOCK_PROJECT } from '@testing/mocks/project.mock';
import { MOCK_PROVIDER } from '@testing/mocks/provider.mock';
import { MOCK_COLLECTION_SUBMISSION_WITH_GUID } from '@testing/mocks/submission.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import {
  CustomDialogServiceMockBuilder,
  CustomDialogServiceMockType,
} from '@testing/providers/custom-dialog-provider.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import { provideMockStore } from '@testing/providers/store-provider.mock';

import { AddToCollectionComponent } from './add-to-collection.component';

interface SetupOptions {
  projectId?: string | null;
  currentSubmission?: CollectionProjectSubmission | null;
}

describe('AddToCollectionComponent', () => {
  function setup(options: SetupOptions = {}): {
    fixture: ComponentFixture<AddToCollectionComponent>;
    component: AddToCollectionComponent;
    mockRouter: RouterMockType;
    mockCustomDialogService: CustomDialogServiceMockType;
  } {
    const { projectId = null, currentSubmission = null } = options;

    const mockRouter = RouterMockBuilder.create().build();
    const routeParams: Record<string, string> = { providerId: 'provider-1' };
    if (projectId) routeParams['id'] = projectId;

    const mockActivatedRoute = ActivatedRouteMockBuilder.create().withParams(routeParams).build();
    const mockCustomDialogService = CustomDialogServiceMockBuilder.create().build();

    TestBed.configureTestingModule({
      imports: [
        AddToCollectionComponent,
        ...MockComponents(
          LoadingSpinnerComponent,
          SelectProjectStepComponent,
          ProjectMetadataStepComponent,
          ProjectContributorsStepComponent,
          CollectionMetadataStepComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute, mockActivatedRoute),
        MockProvider(Router, mockRouter),
        MockProvider(CustomDialogService, mockCustomDialogService),
        MockProvider(ToastService),
        MockProvider(LoaderService),
        provideMockStore({
          signals: [
            { selector: CollectionsSelectors.getCollectionProviderLoading, value: false },
            { selector: CollectionsSelectors.getCollectionProvider, value: MOCK_PROVIDER },
            { selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT },
            { selector: UserSelectors.getCurrentUser, value: MOCK_USER },
            { selector: AddToCollectionSelectors.getCurrentCollectionSubmission, value: currentSubmission },
          ],
        }),
      ],
    });

    const fixture = TestBed.createComponent(AddToCollectionComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component, mockRouter, mockCustomDialogService };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    const { component } = setup();
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.SelectProject);
    expect(component.projectMetadataSaved()).toBe(false);
    expect(component.projectContributorsSaved()).toBe(false);
    expect(component.collectionMetadataSaved()).toBe(false);
    expect(component.allowNavigation()).toBe(false);
  });

  it('should handle project selection', () => {
    const { component } = setup();
    component.handleProjectSelected();
    expect(component.projectContributorsSaved()).toBe(false);
    expect(component.projectMetadataSaved()).toBe(false);
    expect(component.allowNavigation()).toBe(false);
  });

  it('should handle step change', () => {
    const { component } = setup();
    component.handleChangeStep(AddToCollectionSteps.ProjectMetadata);
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.ProjectMetadata);
  });

  it('should handle project metadata saved', () => {
    const { component } = setup();
    component.handleProjectMetadataSaved();
    expect(component.projectMetadataSaved()).toBe(true);
  });

  it('should handle contributors saved', () => {
    const { component } = setup();
    component.handleContributorsSaved();
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.CollectionMetadata);
    expect(component.projectContributorsSaved()).toBe(true);
  });

  it('should handle collection metadata saved', () => {
    const { component } = setup();
    const mockForm = new FormGroup({});
    component.handleCollectionMetadataSaved(mockForm);
    expect(component.collectionMetadataForm).toBe(mockForm);
    expect(component.collectionMetadataSaved()).toBe(true);
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.Complete);
  });

  it('should have actions defined', () => {
    const { component } = setup();
    expect(component.actions).toBeDefined();
    expect(component.actions.getCollectionProvider).toBeDefined();
    expect(component.actions.clearAddToCollectionState).toBeDefined();
  });

  it('should report provider loading state', () => {
    const { component } = setup();
    expect(component.isProviderLoading()).toBe(false);
  });

  it('should have collection provider data', () => {
    const { component } = setup();
    expect(component.collectionProvider()).toEqual(MOCK_PROVIDER);
  });

  it('should have selected project data', () => {
    const { component } = setup();
    expect(component.selectedProject()).toEqual(MOCK_PROJECT);
  });

  it('should have current user data', () => {
    const { component } = setup();
    expect(component.currentUser()).toEqual(MOCK_USER);
  });

  it('should not be in edit mode when no project id in route', () => {
    const { component } = setup();
    expect(component.isEditMode()).toBe(false);
  });

  it('should be in edit mode when project id is present in route', () => {
    const { component } = setup({ projectId: 'project-1' });
    expect(component.isEditMode()).toBe(true);
  });

  it('should not show remove button in new mode', () => {
    const { component } = setup();
    expect(component.showRemoveButton()).toBe(false);
  });

  it('should not show remove button in edit mode with non-accepted state', () => {
    const currentSubmission: CollectionProjectSubmission = {
      submission: { ...MOCK_COLLECTION_SUBMISSION_WITH_GUID, reviewsState: CollectionSubmissionReviewState.Pending },
      project: MOCK_PROJECT,
    };
    const { component } = setup({ projectId: 'project-1', currentSubmission });
    expect(component.showRemoveButton()).toBe(false);
  });

  it('should show remove button in edit mode with accepted state', () => {
    const currentSubmission: CollectionProjectSubmission = {
      submission: { ...MOCK_COLLECTION_SUBMISSION_WITH_GUID, reviewsState: CollectionSubmissionReviewState.Accepted },
      project: MOCK_PROJECT,
    };
    const { component } = setup({ projectId: 'project-1', currentSubmission });
    expect(component.showRemoveButton()).toBe(true);
  });

  it('should allow deactivation when allowNavigation is true', () => {
    const { component } = setup();
    component.allowNavigation.set(true);
    expect(component.canDeactivate()).toBe(true);
  });

  it('should block deactivation when there are unsaved changes', () => {
    const { component } = setup();
    expect(component.canDeactivate()).toBe(false);
  });

  it('should navigate after adding to collection in edit mode', () => {
    const { component, mockRouter } = setup({ projectId: 'project-1' });

    component.handleAddToCollection();

    expect(mockRouter.navigate).toHaveBeenCalledWith([MOCK_PROJECT.id, 'overview']);
    expect(component.allowNavigation()).toBe(true);
  });

  it('should open confirmation dialog and navigate after confirmation in new mode', () => {
    const { component, mockRouter, mockCustomDialogService } = setup();

    const onClose = new Subject<boolean>();
    mockCustomDialogService.open.mockReturnValue({ onClose } as any);

    component.handleAddToCollection();
    onClose.next(true);

    expect(mockCustomDialogService.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([MOCK_PROJECT.id, 'overview']);
    expect(component.allowNavigation()).toBe(true);
  });

  it('should navigate after successful remove from collection', () => {
    const { component, mockRouter, mockCustomDialogService } = setup({ projectId: 'project-1' });

    const onClose = new Subject<RemoveFromCollectionDialogResult>();
    mockCustomDialogService.open.mockReturnValue({ onClose } as any);

    component.handleRemoveFromCollection();
    onClose.next({ confirmed: true, comment: '' });

    expect(mockCustomDialogService.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([MOCK_PROJECT.id, 'overview']);
    expect(component.allowNavigation()).toBe(true);
  });
});
