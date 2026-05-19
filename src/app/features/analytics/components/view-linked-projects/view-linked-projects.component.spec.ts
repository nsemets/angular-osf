import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { PaginatorState } from 'primeng/paginator';

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RelatedNodeCardComponent } from '@osf/features/analytics/components/related-node-card/related-node-card.component';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { CurrentResourceType, ResourceType } from '@osf/shared/enums/resource-type.enum';
import { GetAllLinkedProjects, LinkedProjectsSelectors } from '@osf/shared/stores/linked-projects';

import { MOCK_NODE_WITH_ADMIN } from '@testing/mocks/node.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { ViewLinkedProjectsComponent } from './view-linked-projects.component';

interface SetupOverrides extends BaseSetupOverrides {
  resourceId?: string;
  resourceType?: ResourceType;
  hasParentRoute?: boolean;
}

const defaultSignals: SignalOverride[] = [
  { selector: LinkedProjectsSelectors.getLinkedProjects, value: [] },
  { selector: LinkedProjectsSelectors.getLinkedProjectsLoading, value: false },
  { selector: LinkedProjectsSelectors.getLinkedProjectsTotalCount, value: 0 },
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

describe('ViewLinkedProjectsComponent', () => {
  function setup(overrides: SetupOverrides = {}) {
    TestBed.configureTestingModule({
      imports: [
        ViewLinkedProjectsComponent,
        ...MockComponents(
          SubHeaderComponent,
          LoadingSpinnerComponent,
          CustomPaginatorComponent,
          RelatedNodeCardComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        provideMockStore({
          signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides),
        }),
        MockProvider(ActivatedRoute, buildActivatedRoute(overrides)),
      ],
    });

    const fixture = TestBed.createComponent(ViewLinkedProjectsComponent);
    const component = fixture.componentInstance;
    const store = TestBed.inject(Store);

    fixture.detectChanges();

    return { fixture, component, store };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should resolve resourceId from parent route params', () => {
    const { component } = setup({ resourceId: 'project-42' });
    expect(component.resourceId()).toBe('project-42');
  });

  it('should map project route data to nodes api resource type', () => {
    const { component } = setup({ resourceType: ResourceType.Project });
    expect(component.resourceType()).toBe(CurrentResourceType.Projects);
  });

  it('should map registration route data to registrations api resource type', () => {
    const { component } = setup({ resourceType: ResourceType.Registration });
    expect(component.resourceType()).toBe(CurrentResourceType.Registrations);
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

  it('should dispatch GetAllLinkedProjects when route context is ready', () => {
    const { store } = setup({ resourceId: 'rid' });
    expect(store.dispatch).toHaveBeenCalledWith(new GetAllLinkedProjects('rid', CurrentResourceType.Projects, 1, 10));
  });

  it('should dispatch GetAllLinkedProjects when page changes', () => {
    const { component, fixture, store } = setup({ resourceId: 'rid' });
    vi.spyOn(store, 'dispatch').mockClear();
    component.onPageChange({ page: 1 } as PaginatorState);
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(new GetAllLinkedProjects('rid', CurrentResourceType.Projects, 2, 10));
  });

  it('should not dispatch GetAllLinkedProjects when parent route id is missing', () => {
    const { store } = setup({ hasParentRoute: false });
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(GetAllLinkedProjects));
  });

  it('should show loading spinner while linked projects are loading', () => {
    const { fixture } = setup({
      selectorOverrides: [{ selector: LinkedProjectsSelectors.getLinkedProjectsLoading, value: true }],
    });
    expect(fixture.nativeElement.querySelector('osf-loading-spinner')).toBeTruthy();
  });

  it('should show empty state when loaded with no linked projects', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('p.mt-5.text-center')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('osf-related-node-card')).toBeNull();
  });

  it('should render related node cards when linked projects exist', () => {
    const { fixture } = setup({
      selectorOverrides: [
        {
          selector: LinkedProjectsSelectors.getLinkedProjects,
          value: [MOCK_NODE_WITH_ADMIN],
        },
      ],
    });
    expect(fixture.nativeElement.querySelectorAll('osf-related-node-card').length).toBe(1);
  });
});
