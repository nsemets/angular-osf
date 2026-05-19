import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { PaginatorState } from 'primeng/paginator';

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { RelatedNodeCardComponent } from '@osf/features/analytics/components/related-node-card/related-node-card.component';
import { RelatedNodeMenuAction } from '@osf/features/analytics/enums/related-node-menu-action.enum';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { DuplicatesSelectors, GetAllDuplicates } from '@osf/shared/stores/duplicates';

import { MOCK_NODE_WITH_ADMIN } from '@testing/mocks/node.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder } from '@testing/providers/router-provider.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { ViewDuplicatesComponent } from './view-duplicates.component';

interface SetupOverrides extends BaseSetupOverrides {
  resourceId?: string;
  resourceType?: ResourceType;
  hasParentRoute?: boolean;
}

const defaultSignals: SignalOverride[] = [
  { selector: DuplicatesSelectors.getDuplicates, value: [] },
  { selector: DuplicatesSelectors.getDuplicatesLoading, value: false },
  { selector: DuplicatesSelectors.getDuplicatesTotalCount, value: 0 },
  { selector: UserSelectors.isAuthenticated, value: true },
];

function buildActivatedRoute(overrides: SetupOverrides): Partial<ActivatedRoute> {
  const resourceId = overrides.resourceId ?? overrides.routeParams?.['id'] ?? 'rid';
  const resourceType = overrides.resourceType ?? ResourceType.Project;
  const hasParentRoute = overrides.hasParentRoute ?? overrides.hasParent !== false;

  if (!hasParentRoute) {
    return ActivatedRouteMockBuilder.create().withData({ resourceType }).withNoParent().build();
  }

  const parentRoute = ActivatedRouteMockBuilder.create().withParams({ id: resourceId }).withNoParent().build();

  return ActivatedRouteMockBuilder.create().withData({ resourceType }).withParentRoute(parentRoute).build();
}

describe('ViewDuplicatesComponent', () => {
  function setup(overrides: SetupOverrides = {}) {
    const mockCustomDialogService = CustomDialogServiceMockBuilder.create().build();
    const routerMock = RouterMockBuilder.create().build();

    TestBed.configureTestingModule({
      imports: [
        ViewDuplicatesComponent,
        ...MockComponents(
          SubHeaderComponent,
          LoadingSpinnerComponent,
          CustomPaginatorComponent,
          RelatedNodeCardComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
        MockProvider(CustomDialogService, mockCustomDialogService),
        MockProvider(Router, routerMock),
        MockProvider(ActivatedRoute, buildActivatedRoute(overrides)),
      ],
    });

    const fixture = TestBed.createComponent(ViewDuplicatesComponent);
    const component = fixture.componentInstance;
    const store = TestBed.inject(Store);
    const router = TestBed.inject(Router);

    fixture.detectChanges();

    return { fixture, component, store, router, mockCustomDialogService };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should resolve resourceId from parent route params', () => {
    const { component } = setup({ resourceId: 'project-42' });
    expect(component.resourceId()).toBe('project-42');
  });

  it('should resolve project resourceType from route data', () => {
    const { component } = setup({ resourceType: ResourceType.Project });
    expect(component.resourceType()).toBe(ResourceType.Project);
  });

  it('should resolve registration resourceType from route data', () => {
    const { component } = setup({ resourceType: ResourceType.Registration });
    expect(component.resourceType()).toBe(ResourceType.Registration);
  });

  it('should compute firstIndex from current page', () => {
    const { component } = setup();
    expect(component.firstIndex()).toBe(0);
    component.currentPage.set(3);
    expect(component.firstIndex()).toBe(20);
  });

  it('should update currentPage when page is defined', () => {
    const { component } = setup();
    component.onPageChange({ page: 1 } as PaginatorState);
    expect(component.currentPage()).toBe(2);
  });

  it('should not update currentPage when page is undefined', () => {
    const { component } = setup();
    component.currentPage.set(5);
    component.onPageChange({ page: undefined } as PaginatorState);
    expect(component.currentPage()).toBe(5);
  });

  it('should dispatch GetAllDuplicates when route context is ready', () => {
    const { store } = setup({ resourceId: 'rid', resourceType: ResourceType.Project });
    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', ResourceType.Project, 1, 10));
  });

  it('should dispatch GetAllDuplicates for registration route context', () => {
    const { store } = setup({ resourceId: 'reg-1', resourceType: ResourceType.Registration });
    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('reg-1', ResourceType.Registration, 1, 10));
  });

  it('should dispatch GetAllDuplicates when page changes', () => {
    const { component, fixture, store } = setup({ resourceId: 'rid', resourceType: ResourceType.Project });
    vi.spyOn(store, 'dispatch').mockClear();
    component.onPageChange({ page: 1 } as PaginatorState);
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(new GetAllDuplicates('rid', ResourceType.Project, 2, 10));
  });

  it('should not dispatch GetAllDuplicates when parent route id is missing', () => {
    const { store } = setup({ hasParentRoute: false, resourceType: ResourceType.Project });
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(GetAllDuplicates));
  });

  it('should navigate to contributors when manage contributors menu action is selected', () => {
    const { component, router } = setup();
    component.handleMenuAction(RelatedNodeMenuAction.ManageContributors, 'fork-1');
    expect(router.navigate).toHaveBeenCalledWith(['fork-1', 'contributors']);
  });

  it('should navigate to settings when settings menu action is selected', () => {
    const { component, router } = setup();
    component.handleMenuAction(RelatedNodeMenuAction.Settings, 'fork-2');
    expect(router.navigate).toHaveBeenCalledWith(['fork-2', 'settings']);
  });

  it('should show loading spinner while duplicates are loading', () => {
    const { fixture } = setup({
      selectorOverrides: [{ selector: DuplicatesSelectors.getDuplicatesLoading, value: true }],
    });
    expect(fixture.nativeElement.querySelector('osf-loading-spinner')).toBeTruthy();
  });

  it('should show empty state when loaded with no duplicates', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('p.mt-5.text-center')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('osf-related-node-card')).toBeNull();
  });

  it('should render related node cards when duplicates exist', () => {
    const { fixture } = setup({
      selectorOverrides: [
        {
          selector: DuplicatesSelectors.getDuplicates,
          value: [{ ...MOCK_NODE_WITH_ADMIN, canShowForkMenu: true }],
        },
      ],
    });
    expect(fixture.nativeElement.querySelectorAll('osf-related-node-card').length).toBe(1);
  });
});
