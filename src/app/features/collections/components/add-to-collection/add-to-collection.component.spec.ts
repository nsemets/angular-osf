import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { Subject } from 'rxjs';

import { Mock } from 'vitest';

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { AddToCollectionSteps } from '@osf/features/collections/enums';
import {
  AddToCollectionSelectors,
  ClearAddToCollectionState,
  GetCurrentCollectionSubmission,
  UpdateCollectionSubmission,
} from '@osf/features/collections/store/add-to-collection';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { CollectionSubmissionReviewState } from '@shared/enums/collection-submission-review-state.enum';
import { CollectionProjectSubmission, CollectionProvider } from '@shared/models/collections/collections.model';
import { BrandService } from '@shared/services/brand.service';
import { CustomDialogService } from '@shared/services/custom-dialog.service';
import { HeaderStyleService } from '@shared/services/header-style.service';
import { LoaderService } from '@shared/services/loader.service';
import { ToastService } from '@shared/services/toast.service';
import { CollectionsSelectors, GetCollectionProvider } from '@shared/stores/collections';
import { ProjectsSelectors, SetSelectedProject } from '@shared/stores/projects';

import { MOCK_COLLECTION_SUBMISSION_1 } from '@testing/mocks/collections-submissions.mock';
import { MOCK_USER } from '@testing/mocks/data.mock';
import { MOCK_PROJECT } from '@testing/mocks/project.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { BrandServiceMock, BrandServiceMockType } from '@testing/providers/brand-service.mock';
import {
  CustomDialogServiceMockBuilder,
  CustomDialogServiceMockType,
} from '@testing/providers/custom-dialog-provider.mock';
import { HeaderStyleServiceMock, HeaderStyleServiceMockType } from '@testing/providers/header-style-service.mock';
import { LoaderServiceMock } from '@testing/providers/loader-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import { mergeSignalOverrides, provideMockStore, SignalOverride } from '@testing/providers/store-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import { AddToCollectionConfirmationDialogComponent } from './add-to-collection-confirmation-dialog/add-to-collection-confirmation-dialog.component';
import { CollectionMetadataStepComponent } from './collection-metadata-step/collection-metadata-step.component';
import { ProjectContributorsStepComponent } from './project-contributors-step/project-contributors-step.component';
import { ProjectMetadataStepComponent } from './project-metadata-step/project-metadata-step.component';
import { SelectProjectStepComponent } from './select-project-step/select-project-step.component';
import { AddToCollectionComponent } from './add-to-collection.component';

const PROVIDER_ID = 'provider-1';

function createMockCollectionProvider(overrides: Partial<CollectionProvider> = {}): CollectionProvider {
  return {
    id: PROVIDER_ID,
    type: 'collection-providers',
    name: 'Provider',
    description: '',
    domain: 'osf.io',
    advisoryBoard: '',
    allowCommenting: false,
    allowSubmissions: true,
    domainRedirectEnabled: false,
    emailSupport: null,
    example: null,
    facebookAppId: null,
    footerLinks: '',
    permissions: [],
    reviewsWorkflow: '',
    sharePublishType: '',
    shareSource: '',
    assets: {},
    primaryCollection: { id: 'col-1', type: 'collections' },
    brand: null,
    ...overrides,
  } as CollectionProvider;
}

const defaultSignals: SignalOverride[] = [
  { selector: CollectionsSelectors.getCollectionProviderLoading, value: false },
  { selector: CollectionsSelectors.getCollectionProvider, value: null },
  { selector: ProjectsSelectors.getSelectedProject, value: null },
  { selector: UserSelectors.getCurrentUser, value: MOCK_USER },
  { selector: AddToCollectionSelectors.getCurrentCollectionSubmission, value: null },
];

describe('AddToCollectionComponent', () => {
  let component: AddToCollectionComponent;
  let fixture: ComponentFixture<AddToCollectionComponent>;
  let store: Store;
  let routerMock: RouterMockType;
  let customDialogMock: CustomDialogServiceMockType;
  let dialogCloseSubject: Subject<unknown>;
  let brandServiceMock: BrandServiceMockType;
  let headerStyleServiceMock: HeaderStyleServiceMockType;
  let loaderServiceMock: LoaderServiceMock;
  let toastServiceMock: ToastServiceMockType;

  function setup(
    options: {
      routeParams?: Record<string, string>;
      hasParent?: boolean;
      selectorOverrides?: SignalOverride[];
      platformId?: string;
    } = {}
  ) {
    const routeBuilder = ActivatedRouteMockBuilder.create().withParams(
      options.routeParams ?? { providerId: PROVIDER_ID }
    );
    if (options.hasParent === false) {
      routeBuilder.withNoParent();
    }
    const mockRoute = routeBuilder.build();
    routerMock = RouterMockBuilder.create().withUrl('/collections/add').build();
    dialogCloseSubject = new Subject();
    customDialogMock = CustomDialogServiceMockBuilder.create()
      .withOpen(
        vi.fn().mockReturnValue({
          onClose: dialogCloseSubject.asObservable(),
          close: vi.fn(),
        })
      )
      .build();
    brandServiceMock = BrandServiceMock.simple();
    headerStyleServiceMock = HeaderStyleServiceMock.simple();
    loaderServiceMock = new LoaderServiceMock();
    toastServiceMock = ToastServiceMock.simple();

    const signals = mergeSignalOverrides(defaultSignals, options.selectorOverrides);

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
        provideRouter([]),
        MockProvider(ActivatedRoute, mockRoute),
        MockProvider(Router, routerMock),
        MockProvider(CustomDialogService, customDialogMock),
        MockProvider(BrandService, brandServiceMock),
        MockProvider(HeaderStyleService, headerStyleServiceMock),
        MockProvider(LoaderService, loaderServiceMock),
        MockProvider(ToastService, toastServiceMock),
        MockProvider(PLATFORM_ID, options.platformId ?? 'browser'),
        provideMockStore({ signals }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(AddToCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to not-found when providerId is missing', () => {
    setup({ routeParams: {} });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/not-found']);
  });

  it('should dispatch GetCollectionProvider when providerId is present', () => {
    setup();
    expect(store.dispatch).toHaveBeenCalledWith(new GetCollectionProvider(PROVIDER_ID));
  });

  it('should dispatch GetCurrentCollectionSubmission when route has project id and collection exists', () => {
    setup({
      routeParams: { providerId: PROVIDER_ID, id: MOCK_PROJECT.id },
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
      ],
    });
    expect(store.dispatch).toHaveBeenCalledWith(new GetCurrentCollectionSubmission('col-1', MOCK_PROJECT.id));
  });

  it('should dispatch SetSelectedProject when submission has project and none selected', () => {
    const submission: CollectionProjectSubmission = {
      project: MOCK_PROJECT,
      submission: {
        ...MOCK_COLLECTION_SUBMISSION_1,
        reviewsState: CollectionSubmissionReviewState.Pending,
      },
    };
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
        { selector: AddToCollectionSelectors.getCurrentCollectionSubmission, value: submission },
      ],
    });
    expect(store.dispatch).toHaveBeenCalledWith(new SetSelectedProject(MOCK_PROJECT));
  });

  it('should apply branding when collection provider has brand', () => {
    const brand = {
      id: 'b1',
      name: 'B',
      heroLogoImageUrl: 'https://x/h.png',
      heroBackgroundImageUrl: 'https://x/hb.png',
      topNavLogoImageUrl: 'https://x/n.png',
      primaryColor: '#111',
      secondaryColor: '#222',
      backgroundColor: '#333',
    };
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider({ brand }) },
      ],
    });
    expect(brandServiceMock.applyBranding).toHaveBeenCalledWith(brand);
    expect(headerStyleServiceMock.applyHeaderStyles).toHaveBeenCalledWith('#222', '#333');
  });

  it('should reset saved flags when project is selected', () => {
    setup();
    component.projectMetadataSaved.set(true);
    component.projectContributorsSaved.set(true);
    component.allowNavigation.set(true);
    component.handleProjectSelected();
    expect(component.projectMetadataSaved()).toBe(false);
    expect(component.projectContributorsSaved()).toBe(false);
    expect(component.allowNavigation()).toBe(false);
  });

  it('should update stepper value on step change', () => {
    setup();
    component.handleChangeStep(AddToCollectionSteps.ProjectMetadata);
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.ProjectMetadata);
  });

  it('should mark project metadata saved', () => {
    setup();
    component.handleProjectMetadataSaved();
    expect(component.projectMetadataSaved()).toBe(true);
  });

  it('should mark contributors saved and move to collection metadata step', () => {
    setup();
    component.handleContributorsSaved();
    expect(component.projectContributorsSaved()).toBe(true);
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.CollectionMetadata);
  });

  it('should store collection metadata form and complete step', () => {
    setup();
    const form = new FormGroup({});
    component.handleCollectionMetadataSaved(form);
    expect(component.collectionMetadataForm).toBe(form);
    expect(component.collectionMetadataSaved()).toBe(true);
    expect(component.stepperActiveValue()).toBe(AddToCollectionSteps.Complete);
  });

  it('should return true from canDeactivate when navigation is allowed', () => {
    setup();
    component.allowNavigation.set(true);
    expect(component.canDeactivate()).toBe(true);
  });

  it('should return true from canDeactivate when there are no unsaved changes', () => {
    setup();
    expect(component.canDeactivate()).toBe(true);
  });

  it('should return false from canDeactivate when there are unsaved changes', () => {
    setup({
      selectorOverrides: [{ selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT }],
    });
    expect(component.canDeactivate()).toBe(false);
  });

  it('should warn on beforeunload when there are unsaved changes', () => {
    setup({
      selectorOverrides: [{ selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT }],
    });
    const event = { preventDefault: vi.fn() } as unknown as BeforeUnloadEvent;
    const result = component.onBeforeUnload(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should not prevent beforeunload when navigation is allowed', () => {
    setup({
      selectorOverrides: [{ selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT }],
    });
    component.allowNavigation.set(true);
    const event = { preventDefault: vi.fn() } as unknown as BeforeUnloadEvent;
    const result = component.onBeforeUnload(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should open confirmation dialog when adding in create mode', () => {
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
        { selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT },
      ],
    });
    component.handleCollectionMetadataSaved(new FormGroup({}));
    component.handleAddToCollection();
    expect(customDialogMock.open).toHaveBeenCalledWith(
      AddToCollectionConfirmationDialogComponent,
      expect.objectContaining({
        header: 'collections.addToCollection.confirmationDialogHeader',
        width: '500px',
        data: expect.objectContaining({
          project: MOCK_PROJECT,
          payload: expect.objectContaining({
            collectionId: 'col-1',
            projectId: MOCK_PROJECT.id,
            userId: MOCK_USER.id,
          }),
        }),
      })
    );
  });

  it('should navigate after confirmation dialog closes with a truthy result', () => {
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
        { selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT },
      ],
    });
    component.handleCollectionMetadataSaved(new FormGroup({}));
    component.handleAddToCollection();
    dialogCloseSubject.next(true);
    expect(routerMock.navigate).toHaveBeenCalledWith([MOCK_PROJECT.id, 'overview']);
  });

  it('should update submission in edit mode and navigate on success', () => {
    setup({
      routeParams: { providerId: PROVIDER_ID, id: MOCK_PROJECT.id },
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
        { selector: ProjectsSelectors.getSelectedProject, value: MOCK_PROJECT },
      ],
    });
    component.handleCollectionMetadataSaved(new FormGroup({}));
    (store.dispatch as Mock).mockClear();
    component.handleAddToCollection();
    expect(loaderServiceMock.show).toHaveBeenCalled();
    expect(loaderServiceMock.hide).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(
      new UpdateCollectionSubmission({
        collectionId: 'col-1',
        projectId: MOCK_PROJECT.id,
        collectionMetadata: {},
        userId: MOCK_USER.id,
      })
    );
    expect(toastServiceMock.showSuccess).toHaveBeenCalledWith(
      'collections.addToCollection.confirmationDialogToastMessage'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([MOCK_PROJECT.id, 'overview']);
  });

  it('should not open remove dialog when project is missing', () => {
    setup({
      routeParams: { providerId: PROVIDER_ID, id: MOCK_PROJECT.id },
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
      ],
    });
    component.handleRemoveFromCollection();
    expect(customDialogMock.open).not.toHaveBeenCalled();
  });

  it('should clear state on destroy in browser', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    fixture.destroy();
    expect(store.dispatch).toHaveBeenCalledWith(expect.any(ClearAddToCollectionState));
  });

  it('should not dispatch clear state on destroy when not in browser', () => {
    setup({ platformId: 'server' });
    (store.dispatch as Mock).mockClear();
    fixture.destroy();
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
