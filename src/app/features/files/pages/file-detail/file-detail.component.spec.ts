import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { MetadataSelectors } from '@osf/features/metadata/store';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { MetadataTabsComponent } from '@osf/shared/components/metadata-tabs/metadata-tabs.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ResourceType } from '@shared/enums/resource-type.enum';
import { CustomConfirmationService } from '@shared/services/custom-confirmation.service';
import { DataciteService } from '@shared/services/datacite/datacite.service';
import { ToastService } from '@shared/services/toast.service';

import { FileDetailsMock } from '@testing/mocks/file-details.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';
import { DataciteServiceMock, DataciteServiceMockType } from '@testing/providers/datacite.service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { FileKeywordsComponent } from '../../components/file-keywords/file-keywords.component';
import { FileMetadataComponent } from '../../components/file-metadata/file-metadata.component';
import { FileResourceMetadataComponent } from '../../components/file-resource-metadata/file-resource-metadata.component';
import { FileRevisionsComponent } from '../../components/file-revisions/file-revisions.component';
import { FileDetailTab } from '../../enums/file-detail-tab.enum';
import { DeleteEntry, FilesSelectors, GetFileRevisions } from '../../store';

import { FileDetailComponent } from './file-detail.component';

describe('FileDetailComponent', () => {
  let fixture: ComponentFixture<FileDetailComponent>;
  let component: FileDetailComponent;
  let store: Store;
  let dataciteService: DataciteServiceMockType;
  let customConfirmationService: CustomConfirmationServiceMockType;
  let routerMock: RouterMockType;

  const file = FileDetailsMock.simple({
    guid: 'file-1',
    links: {
      info: 'https://osf.test/info',
      move: 'https://osf.test/move',
      upload: 'https://osf.test/upload',
      delete: 'https://osf.test/delete',
      download: 'https://osf.test/download',
      render: 'https://osf.test/render',
      html: 'https://osf.test/html',
      self: 'https://osf.test/self',
    },
    target: { id: 'node-1', type: ResourceType.Project } as never,
  });

  interface SetupOverrides extends BaseSetupOverrides {
    routeParams?: Record<string, string>;
  }

  function setup(overrides: SetupOverrides = {}) {
    dataciteService = DataciteServiceMock.simple();
    customConfirmationService = CustomConfirmationServiceMock.simple();
    routerMock = RouterMockBuilder.create().withUrl('/node-1/files/osf/file-1').build();
    const routeMock = ActivatedRouteMockBuilder.create()
      .withParams(overrides.routeParams ?? { providerId: 'osf', fileGuid: 'file-1' })
      .build();

    const defaultSignals: SignalOverride[] = [
      { selector: FilesSelectors.getOpenedFile, value: file },
      { selector: FilesSelectors.getResourceMetadata, value: null },
      { selector: FilesSelectors.isOpenedFileLoading, value: false },
      { selector: MetadataSelectors.getCedarRecords, value: [] },
      { selector: MetadataSelectors.getCedarTemplates, value: null },
      { selector: FilesSelectors.isFilesAnonymous, value: false },
      { selector: FilesSelectors.getFileCustomMetadata, value: null },
      { selector: FilesSelectors.isFileMetadataLoading, value: false },
      { selector: FilesSelectors.getContributors, value: [] },
      { selector: FilesSelectors.isResourceContributorsLoading, value: false },
      { selector: FilesSelectors.getFileRevisions, value: null },
      { selector: FilesSelectors.isFileRevisionsLoading, value: false },
      { selector: FilesSelectors.hasWriteAccess, value: true },
    ];

    TestBed.configureTestingModule({
      imports: [
        FileDetailComponent,
        ...MockComponents(
          SubHeaderComponent,
          LoadingSpinnerComponent,
          FileKeywordsComponent,
          FileRevisionsComponent,
          FileMetadataComponent,
          FileResourceMetadataComponent,
          MetadataTabsComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute, routeMock),
        MockProvider(DataciteService, dataciteService),
        MockProvider(Router, routerMock),
        MockProvider(ToastService),
        MockProvider(CustomConfirmationService, customConfirmationService),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(FileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should log identifiable view on init', () => {
    setup();
    expect(dataciteService.logIdentifiableView).toHaveBeenCalledWith(component.fileMetadata$);
  });

  it('should call datacite and open revision download url', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window);

    component.downloadRevision('3');

    expect(dataciteService.logIdentifiableDownload).toHaveBeenCalledWith(component.fileMetadata$);
    expect(openSpy).toHaveBeenCalledWith('https://osf.test/download/?revision=3');
    expect(store.dispatch).toHaveBeenCalledWith(new GetFileRevisions('https://osf.test/upload'));
  });

  it('should confirm delete with file info', () => {
    setup();

    component.confirmDelete();

    expect(customConfirmationService.confirmDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        headerKey: 'files.dialogs.deleteFile.title',
        messageKey: 'files.dialogs.deleteFile.message',
        messageParams: { name: file.name },
      })
    );
  });

  it('should delete entry and navigate to files page', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    component.resourceId = 'node-1';
    component.deleteEntry('/delete');

    expect(store.dispatch).toHaveBeenCalledWith(new DeleteEntry('/delete'));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/node-1/files']);
  });

  it('should update selected tab when tab value is numeric', () => {
    setup();

    component.onTabChange('2');

    expect(component.selectedTab).toBe(2);
  });

  it('should keep selected tab unchanged for non numeric value', () => {
    setup();
    component.selectedTab = FileDetailTab.Details;

    component.onTabChange('not-a-number');

    expect(component.selectedTab).toBe(FileDetailTab.Details);
  });
});
