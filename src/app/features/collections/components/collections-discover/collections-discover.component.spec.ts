import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { Mock } from 'vitest';

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { GlobalSearchComponent } from '@shared/components/global-search/global-search.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { CollectionDetails, CollectionProvider } from '@shared/models/collections/collections.model';
import { EnvironmentModel } from '@shared/models/environment.model';
import { FilterOperatorOption } from '@shared/models/search/discoverable-filter.model';
import { BrandService } from '@shared/services/brand.service';
import { CustomDialogService } from '@shared/services/custom-dialog.service';
import { HeaderStyleService } from '@shared/services/header-style.service';
import {
  CollectionsSelectors,
  GetCollectionDetails,
  GetCollectionProvider,
  SearchCollectionSubmissions,
  SetPageNumber,
  SetSearchValue,
} from '@shared/stores/collections';
import { ResetSearchState, SetDefaultFilterValue, SetExtraFilters } from '@shared/stores/global-search';

import { CEDAR_METADATA_DATA_TEMPLATE_JSON_API_MOCK } from '@testing/mocks/cedar-metadata-data-template-json-api.mock';
import { MOCK_COLLECTIONS_EMPTY_FILTERS } from '@testing/mocks/collections-filters.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { BrandServiceMock, BrandServiceMockType } from '@testing/providers/brand-service.mock';
import { CustomDialogServiceMock, CustomDialogServiceMockType } from '@testing/providers/custom-dialog-provider.mock';
import { EnvironmentTokenMock } from '@testing/providers/environment.token.mock';
import { HeaderStyleServiceMock, HeaderStyleServiceMockType } from '@testing/providers/header-style-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import { mergeSignalOverrides, provideMockStore, SignalOverride } from '@testing/providers/store-provider.mock';

import { CollectionsQuerySyncService } from '../../services';
import { CollectionsHelpDialogComponent } from '../collections-help-dialog/collections-help-dialog.component';
import { CollectionsMainContentComponent } from '../collections-main-content/collections-main-content.component';

import { CollectionsDiscoverComponent } from './collections-discover.component';

const PROVIDER_ID = 'provider-1';

const mockCollectionDetails: CollectionDetails = {
  id: 'col-1',
  type: 'collections',
  title: 'Collection',
  dateCreated: '2024-01-01T00:00:00Z',
  dateModified: '2024-01-02T00:00:00Z',
  bookmarks: false,
  isPromoted: false,
  isPublic: true,
  filters: {
    collectedType: [],
    disease: [],
    dataType: [],
    gradeLevels: [],
    issue: [],
    programArea: [],
    schoolType: [],
    status: [],
    studyDesign: [],
    volume: [],
  },
};

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
    iri: 'https://api.test.osf.io/v2/collections/col-1/',
    assets: {},
    primaryCollection: { id: 'col-1', type: 'collections' },
    brand: null,
    ...overrides,
  } as CollectionProvider;
}

const defaultSignals: SignalOverride[] = [
  { selector: CollectionsSelectors.getCollectionProviderLoading, value: false },
  { selector: CollectionsSelectors.getCollectionProvider, value: null },
  { selector: CollectionsSelectors.getCollectionDetails, value: null },
  { selector: CollectionsSelectors.getAllSelectedFilters, value: { ...MOCK_COLLECTIONS_EMPTY_FILTERS } },
  { selector: CollectionsSelectors.getSortBy, value: '' },
  { selector: CollectionsSelectors.getSearchText, value: '' },
  { selector: CollectionsSelectors.getPageNumber, value: '1' },
];

describe('CollectionsDiscoverComponent', () => {
  let component: CollectionsDiscoverComponent;
  let fixture: ComponentFixture<CollectionsDiscoverComponent>;
  let store: Store;
  let routerMock: RouterMockType;
  let customDialogMock: CustomDialogServiceMockType;
  let querySyncMock: Partial<CollectionsQuerySyncService>;
  let brandServiceMock: BrandServiceMockType;
  let headerStyleServiceMock: HeaderStyleServiceMockType;

  function setup(
    options: {
      routeParams?: Record<string, string>;
      hasParent?: boolean;
      selectorOverrides?: SignalOverride[];
      useCedarEnvironment?: boolean;
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
    routerMock = RouterMockBuilder.create().withUrl('/collections/discover').build();
    customDialogMock = CustomDialogServiceMock.simple();
    querySyncMock = {
      initializeFromUrl: vi.fn(),
      syncStoreToUrl: vi.fn(),
    };
    brandServiceMock = BrandServiceMock.simple();
    headerStyleServiceMock = HeaderStyleServiceMock.simple();

    const envValue = {
      ...EnvironmentTokenMock.useValue,
      collectionSubmissionWithCedar: options.useCedarEnvironment ?? false,
    } as unknown as EnvironmentModel;

    const signals = mergeSignalOverrides(defaultSignals, options.selectorOverrides);

    TestBed.configureTestingModule({
      imports: [
        CollectionsDiscoverComponent,
        ...MockComponents(
          SearchInputComponent,
          CollectionsMainContentComponent,
          GlobalSearchComponent,
          LoadingSpinnerComponent
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
        MockProvider(PLATFORM_ID, options.platformId ?? 'browser'),
        MockProvider(ENVIRONMENT, envValue),
        provideMockStore({ signals }),
      ],
    }).overrideComponent(CollectionsDiscoverComponent, {
      set: {
        providers: [MockProvider(CollectionsQuerySyncService, querySyncMock)],
      },
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(CollectionsDiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should initialize searchControl with empty string', () => {
    setup();
    expect(component.searchControl.value).toBe('');
  });

  it('should navigate to not-found when providerId param is missing', () => {
    setup({ routeParams: {} });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/not-found']);
  });

  it('should dispatch GetCollectionProvider when providerId is present', () => {
    setup({ routeParams: { providerId: 'my-provider' } });
    expect(store.dispatch).toHaveBeenCalledWith(new GetCollectionProvider('my-provider'));
  });

  it('should open help dialog with expected header', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    component.openHelpDialog();
    expect(customDialogMock.open).toHaveBeenCalledWith(CollectionsHelpDialogComponent, {
      header: 'collections.helpDialog.header',
    });
  });

  it('should dispatch search and page when search is triggered in legacy mode', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    component.onSearchTriggered('query');
    expect(store.dispatch).toHaveBeenCalledWith(new SetSearchValue('query'));
    expect(store.dispatch).toHaveBeenCalledWith(new SetPageNumber('1'));
  });

  it('should not dispatch search actions when search is triggered in cedar mode', () => {
    setup({ useCedarEnvironment: true });
    (store.dispatch as Mock).mockClear();
    component.onSearchTriggered('query');
    expect(store.dispatch).not.toHaveBeenCalledWith(new SetSearchValue('query'));
    expect(store.dispatch).not.toHaveBeenCalledWith(new SetPageNumber('1'));
  });

  it('should call query sync initialize and sync when legacy mode store fields are ready', () => {
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
        { selector: CollectionsSelectors.getCollectionDetails, value: mockCollectionDetails },
      ],
    });
    expect(querySyncMock.initializeFromUrl).toHaveBeenCalled();
    expect(querySyncMock.syncStoreToUrl).toHaveBeenCalledWith('', '', MOCK_COLLECTIONS_EMPTY_FILTERS, '1');
  });

  it('should dispatch search collection submissions when legacy prerequisites are met', () => {
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
        { selector: CollectionsSelectors.getCollectionDetails, value: mockCollectionDetails },
      ],
    });
    expect(store.dispatch).toHaveBeenCalledWith(new SearchCollectionSubmissions(PROVIDER_ID, '', {}, '1', ''));
  });

  it('should apply branding when collection provider exposes brand', () => {
    const brand = {
      id: 'b1',
      name: 'B',
      heroLogoImageUrl: 'https://x/h.png',
      heroBackgroundImageUrl: 'https://x/hb.png',
      topNavLogoImageUrl: 'https://x/n.png',
      primaryColor: '#111111',
      secondaryColor: '#222222',
      backgroundColor: '#333333',
    };
    setup({
      selectorOverrides: [
        {
          selector: CollectionsSelectors.getCollectionProvider,
          value: createMockCollectionProvider({ brand }),
        },
      ],
    });
    expect(brandServiceMock.applyBranding).toHaveBeenCalledWith(brand);
    expect(headerStyleServiceMock.applyHeaderStyles).toHaveBeenCalledWith('#222222', '#333333');
  });

  it('should dispatch GetCollectionDetails when primary collection id is available', () => {
    setup({
      selectorOverrides: [
        { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
      ],
    });
    expect(store.dispatch).toHaveBeenCalledWith(new GetCollectionDetails('col-1'));
  });

  it('should dispatch cedar default filters and extra filters when provider and template load', () => {
    const provider = createMockCollectionProvider({
      requiredMetadataTemplate: CEDAR_METADATA_DATA_TEMPLATE_JSON_API_MOCK,
    });
    setup({
      useCedarEnvironment: true,
      selectorOverrides: [{ selector: CollectionsSelectors.getCollectionProvider, value: provider }],
    });
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetDefaultFilterValue('isContainedBy', 'https://api.test.osf.io/v2/collections/col-1/')
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetExtraFilters([
        {
          key: 'Project Name',
          label: 'Project Name',
          operator: FilterOperatorOption.AnyOf,
        },
      ])
    );
  });

  it('should dispatch ResetSearchState on destroy in cedar mode', () => {
    setup({ useCedarEnvironment: true });
    (store.dispatch as Mock).mockClear();
    fixture.destroy();
    expect(store.dispatch).toHaveBeenCalledWith(expect.any(ResetSearchState));
  });

  it('should reset branding and header on destroy in browser', () => {
    setup();
    fixture.destroy();
    expect(headerStyleServiceMock.resetToDefaults).toHaveBeenCalled();
    expect(brandServiceMock.resetBranding).toHaveBeenCalled();
  });

  it('should not dispatch clear actions or reset services on destroy when not in browser', () => {
    setup({ platformId: 'server' });
    (store.dispatch as Mock).mockClear();
    brandServiceMock.resetBranding.mockClear();
    headerStyleServiceMock.resetToDefaults.mockClear();
    fixture.destroy();
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(brandServiceMock.resetBranding).not.toHaveBeenCalled();
    expect(headerStyleServiceMock.resetToDefaults).not.toHaveBeenCalled();
  });

  it('should debounce search control changes and dispatch trimmed search value', () => {
    vi.useFakeTimers();
    try {
      setup({
        selectorOverrides: [
          { selector: CollectionsSelectors.getCollectionProvider, value: createMockCollectionProvider() },
          { selector: CollectionsSelectors.getCollectionDetails, value: mockCollectionDetails },
        ],
      });
      (store.dispatch as Mock).mockClear();
      component.searchControl.setValue('  trimmed  ');
      vi.advanceTimersByTime(300);
      expect(store.dispatch).toHaveBeenCalledWith(new SetSearchValue('trimmed'));
    } finally {
      vi.useRealTimers();
    }
  });
});
