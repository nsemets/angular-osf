import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { PaginatorState } from 'primeng/paginator';

import { of, Subject, throwError } from 'rxjs';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@osf/core/store/user/user.selectors';
import { DeleteComponentDialogComponent } from '@osf/features/project/overview/components/delete-component-dialog/delete-component-dialog.component';
import { ForkProject } from '@osf/features/project/overview/store';
import { ForkRegistry } from '@osf/features/registry/store/registry';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { CurrentResourceType, ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ForkDialogService } from '@osf/shared/services/fork-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { GetResourceWithChildren } from '@osf/shared/stores/current-resource';
import { ClearDuplicates, DuplicatesSelectors, GetAllDuplicates } from '@osf/shared/stores/duplicates';

import { provideOSFCore } from '@testing/osf.testing.provider';
import {
  CustomDialogServiceMock,
  CustomDialogServiceMockBuilder,
  CustomDialogServiceMockType,
} from '@testing/providers/custom-dialog-provider.mock';
import { ForkDialogServiceMock, ForkDialogServiceMockType } from '@testing/providers/fork-dialog.service.mock';
import { LoaderServiceMock } from '@testing/providers/loader-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder } from '@testing/providers/router-provider.mock';
import { BaseSetupOverrides, mergeSignalOverrides, provideMockStore } from '@testing/providers/store-provider.mock';

import { DuplicateMenuAction } from '../../enums/duplicate-menu-action.enum';
import { DuplicateCardComponent } from '../duplicate-card/duplicate-card.component';

import { ViewDuplicatesComponent } from './view-duplicates.component';

interface SetupOverrides extends BaseSetupOverrides {
  resourceType?: ResourceType;
}

describe('ViewDuplicatesComponent', () => {
  let component: ViewDuplicatesComponent;
  let fixture: ComponentFixture<ViewDuplicatesComponent>;
  let store: Store;
  let routerMock: ReturnType<RouterMockBuilder['build']>;
  let mockCustomDialogService: CustomDialogServiceMockType;
  let forkDialogService: ForkDialogServiceMockType;
  let loaderService: LoaderServiceMock;

  function setup(overrides: SetupOverrides = {}) {
    mockCustomDialogService = CustomDialogServiceMockBuilder.create().build();
    forkDialogService = ForkDialogServiceMock.simple();
    loaderService = new LoaderServiceMock();
    routerMock = RouterMockBuilder.create().build();

    const routeBuilder = ActivatedRouteMockBuilder.create()
      .withParams(overrides.routeParams ?? { id: 'rid' })
      .withData({ resourceType: overrides.resourceType ?? ResourceType.Project });

    if (overrides.hasParent === false) {
      routeBuilder.withNoParent();
    }

    const defaultSelectors = [
      { selector: DuplicatesSelectors.getDuplicates, value: [] },
      { selector: DuplicatesSelectors.getDuplicatesLoading, value: false },
      { selector: DuplicatesSelectors.getDuplicatesTotalCount, value: 0 },
      { selector: UserSelectors.isAuthenticated, value: true },
      { selector: UserSelectors.isProjectCreationDisabled, value: false },
    ];

    TestBed.configureTestingModule({
      imports: [
        ViewDuplicatesComponent,
        ...MockComponents(
          SubHeaderComponent,
          LoadingSpinnerComponent,
          CustomPaginatorComponent,
          DuplicateCardComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        provideMockStore({
          signals: mergeSignalOverrides(defaultSelectors, overrides.selectorOverrides),
        }),
        MockProvider(CustomDialogService, mockCustomDialogService),
        MockProvider(ForkDialogService, forkDialogService),
        MockProvider(LoaderService, loaderService),
        MockProvider(Router, routerMock),
        MockProvider(ActivatedRoute, routeBuilder.build()),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(ViewDuplicatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should dispatch getDuplicates on init for a project', () => {
    setup();

    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', CurrentResourceType.Projects, 1, 10));
  });

  it('should dispatch getDuplicates on init for a registration', () => {
    setup({ resourceType: ResourceType.Registration });

    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', CurrentResourceType.Registrations, 1, 10));
  });

  it('should not dispatch getDuplicates when route id is missing', () => {
    setup({ hasParent: false });

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(GetAllDuplicates));
  });

  it('should clear duplicates on destroy', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(new ClearDuplicates());
  });

  it('should compute firstIndex from currentPage', () => {
    setup();
    component.currentPage.set(3);
    expect(component.firstIndex()).toBe(20);
  });

  it('should compute apiResourceType for project and registration', () => {
    setup();
    expect(component.apiResourceType()).toBe(CurrentResourceType.Projects);

    setup({ resourceType: ResourceType.Registration });
    expect(component.apiResourceType()).toBe(CurrentResourceType.Registrations);
  });

  it('should compute duplicate button label for project and registration', () => {
    setup();
    expect(component.duplicateButtonLabel()).toBe('project.overview.actions.forkProjectLabel');

    setup({ resourceType: ResourceType.Registration });
    expect(component.duplicateButtonLabel()).toBe('project.overview.actions.duplicateRegistration');
  });

  it('should compute duplicate button tooltip when project creation is disabled', () => {
    setup({
      selectorOverrides: [{ selector: UserSelectors.isProjectCreationDisabled, value: true }],
    });

    expect(component.preventDuplicateCreation()).toBe(true);
    expect(component.duplicateButtonTooltip()).toBe('project.overview.actions.duplicatingProjectsNotAllowed');
  });

  it('should return empty tooltip when project creation is allowed', () => {
    setup();
    expect(component.duplicateButtonTooltip()).toBe('');
  });

  it('should navigate for manageContributors and settings menu actions', () => {
    setup();

    component.handleMenuAction(DuplicateMenuAction.ManageContributors, 'node-1');
    component.handleMenuAction(DuplicateMenuAction.Settings, 'node-1');

    expect(routerMock.navigate).toHaveBeenCalledWith(['node-1', 'contributors']);
    expect(routerMock.navigate).toHaveBeenCalledWith(['node-1', 'settings']);
  });

  it('should open delete dialog and refresh duplicates when delete succeeds', () => {
    setup();
    const onClose$ = new Subject<{ success: boolean }>();
    mockCustomDialogService.open.mockReturnValue(CustomDialogServiceMock.dialogRefWithClose(onClose$));
    (store.dispatch as Mock).mockClear();

    component.handleMenuAction(DuplicateMenuAction.Delete, 'fork-1');

    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new GetResourceWithChildren('fork-1', 'fork-1', ResourceType.Project));
    expect(loaderService.hide).toHaveBeenCalled();
    expect(mockCustomDialogService.open).toHaveBeenCalledWith(DeleteComponentDialogComponent, {
      header: 'project.overview.dialog.deleteComponent.header',
      width: '650px',
      data: { isForksContext: true },
    });

    (store.dispatch as Mock).mockClear();
    onClose$.next({ success: true });

    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', CurrentResourceType.Projects, 1, 10));
  });

  it('should hide loader when delete components tree fails', () => {
    setup();
    (store.dispatch as Mock).mockImplementation((action: unknown) => {
      if (action instanceof GetResourceWithChildren) {
        return throwError(() => new Error('failed'));
      }
      return of(true);
    });

    component.handleMenuAction(DuplicateMenuAction.Delete, 'fork-1');

    expect(loaderService.show).toHaveBeenCalled();
    expect(loaderService.hide).toHaveBeenCalled();
    expect(mockCustomDialogService.open).not.toHaveBeenCalled();
  });

  it('should confirm fork for the current project', () => {
    setup();

    component.handleFork();

    expect(forkDialogService.confirmFork).toHaveBeenCalledWith(
      expect.objectContaining({ resourceType: CurrentResourceType.Projects })
    );
  });

  it('should confirm fork for the current registration', () => {
    setup({ resourceType: ResourceType.Registration });

    component.handleFork();

    expect(forkDialogService.confirmFork).toHaveBeenCalledWith(
      expect.objectContaining({ resourceType: CurrentResourceType.Registrations })
    );
  });

  it('should not confirm fork when route id is missing', () => {
    setup({ hasParent: false });

    component.handleFork();

    expect(forkDialogService.confirmFork).not.toHaveBeenCalled();
  });

  it('should dispatch ForkProject and refresh duplicates from confirmFork callbacks', () => {
    setup();
    component.handleFork();
    const [options] = forkDialogService.confirmFork.mock.calls[0];
    (store.dispatch as Mock).mockClear();

    options.fork();
    options.onSuccess?.();

    expect(store.dispatch).toHaveBeenCalledWith(new ForkProject('rid'));
    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', CurrentResourceType.Projects, 1, 10));
  });

  it('should dispatch ForkRegistry from confirmFork when resource is a registration', () => {
    setup({ resourceType: ResourceType.Registration });
    component.handleFork();
    const [options] = forkDialogService.confirmFork.mock.calls[0];
    (store.dispatch as Mock).mockClear();

    options.fork();

    expect(store.dispatch).toHaveBeenCalledWith(new ForkRegistry('rid'));
  });

  it('should update currentPage when page is defined', () => {
    setup();
    const event: PaginatorState = { page: 1 } as PaginatorState;
    component.onPageChange(event);
    expect(component.currentPage()).toBe(2);
  });

  it('should not update currentPage when page is undefined', () => {
    setup();
    component.currentPage.set(5);
    const event: PaginatorState = { page: undefined } as PaginatorState;
    component.onPageChange(event);
    expect(component.currentPage()).toBe(5);
  });

  it('should reload duplicates when page changes', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    component.onPageChange({ page: 2 } as PaginatorState);
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', CurrentResourceType.Projects, 3, 10));
  });
});
