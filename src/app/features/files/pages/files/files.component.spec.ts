import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { of } from 'rxjs';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { FileUploadDialogComponent } from '@osf/shared/components/file-upload-dialog/file-upload-dialog.component';
import { FormSelectComponent } from '@osf/shared/components/form-select/form-select.component';
import { GoogleFilePickerComponent } from '@osf/shared/components/google-file-picker/google-file-picker.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SearchInputComponent } from '@osf/shared/components/search-input/search-input.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ViewOnlyLinkMessageComponent } from '@osf/shared/components/view-only-link-message/view-only-link-message.component';
import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CurrentResource } from '@osf/shared/models/current-resource.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { FileLabelModel } from '@osf/shared/models/files/file-label.model';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { FilesService } from '@osf/shared/services/files.service';
import { FilesTreeActionsService } from '@osf/shared/services/files-tree-actions.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';
import { CurrentResourceSelectors, GetResourceDetails } from '@osf/shared/stores/current-resource';
import { DataciteService } from '@shared/services/datacite/datacite.service';

import { MOCK_CONFIGURED_ADDON } from '@testing/mocks/configured-addon.mock';
import { FileModelMock } from '@testing/mocks/file.model.mock';
import { OSF_FILE_MOCK } from '@testing/mocks/osf-file.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { CustomDialogServiceMock, CustomDialogServiceMockType } from '@testing/providers/custom-dialog-provider.mock';
import { DataciteServiceMock, DataciteServiceMockType } from '@testing/providers/datacite.service.mock';
import { FilesServiceMock, FilesServiceMockType } from '@testing/providers/files-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';
import { ViewOnlyLinkHelperMock, ViewOnlyLinkHelperMockType } from '@testing/providers/view-only-link-helper.mock';

import { FilesSelectionActionsComponent } from '../../components/files-selection-actions/files-selection-actions.component';
import { FilesTreeExplorerComponent } from '../../components/files-tree-explorer/files-tree-explorer.component';
import { FileProvider } from '../../constants/file-provider.constants';
import { MoveCopyAction } from '../../enums/move-copy-action.enum';
import { FilesActionsService } from '../../services/files-actions.service';
import { FilesUploadService } from '../../services/files-upload.service';
import {
  DeleteEntry,
  FilesSelectors,
  GetConfiguredStorageAddons,
  GetRootFolders,
  SetMoveDialogCurrentFolder,
} from '../../store';

import { FilesComponent } from './files.component';

interface SetupOverrides extends BaseSetupOverrides {
  routeParams?: Record<string, string>;
  resourceId?: string;
}

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;
  let store: Store;
  let routerMock: RouterMockType;
  let filesService: FilesServiceMockType;
  let toastService: ToastServiceMockType;
  let viewOnlyHelper: ViewOnlyLinkHelperMockType;
  let filesActionsService: {
    deleteSelected: Mock;
    openMoveDialog: Mock;
    openConfirmMoveDialog: Mock;
    openCreateFolderDialog: Mock;
    openRenameFileDialog: Mock;
  };
  let filesTreeActionsService: {
    confirmDropFiles: Mock;
    confirmDeleteEntry: Mock;
  };
  let filesUploadService: {
    uploadFiles: Mock;
  };
  let customDialogService: CustomDialogServiceMockType;
  let dataciteService: DataciteServiceMockType;

  const currentFolder: FileFolderModel = {
    ...OSF_FILE_MOCK,
    id: 'root-1',
    name: 'OSF Storage',
    provider: FileProvider.OsfStorage,
    links: { ...OSF_FILE_MOCK.links, filesLink: '/files-link', upload: '/upload-link', newFolder: '/new-folder' },
  };

  const currentResource: CurrentResource = { id: 'node-1', type: 'nodes' } as CurrentResource;
  const rootFolderOption: FileLabelModel = { label: 'OSF Storage', folder: currentFolder };

  function setup(overrides: SetupOverrides = {}) {
    routerMock = RouterMockBuilder.create().withUrl('/node-1/files/osfstorage').build();
    (routerMock.createUrlTree as Mock).mockReturnValue({} as never);
    (routerMock.serializeUrl as Mock).mockReturnValue('/serialized');

    filesService = FilesServiceMock.simple();
    toastService = ToastServiceMock.simple();
    viewOnlyHelper = ViewOnlyLinkHelperMock.simple(false);
    customDialogService = CustomDialogServiceMock.simple();
    dataciteService = DataciteServiceMock.simple();

    filesActionsService = {
      deleteSelected: vi.fn(),
      openMoveDialog: vi.fn().mockReturnValue(of(true)),
      openConfirmMoveDialog: vi.fn().mockReturnValue(of(true)),
      openCreateFolderDialog: vi.fn().mockReturnValue(of(true)),
      openRenameFileDialog: vi.fn().mockReturnValue(of({ link: '/rename', newName: 'new-name' })),
    };
    filesTreeActionsService = {
      confirmDropFiles: vi.fn(),
      confirmDeleteEntry: vi.fn(),
    };
    filesUploadService = {
      uploadFiles: vi.fn(),
    };

    const resourceRoute = ActivatedRouteMockBuilder.create()
      .withParams({ id: overrides.resourceId ?? 'node-1' })
      .build();
    const dataRoute = ActivatedRouteMockBuilder.create()
      .withData({ resourceType: ResourceType.Project })
      .withParentRoute(resourceRoute)
      .build();
    const routeMock = ActivatedRouteMockBuilder.create()
      .withParams(overrides.routeParams ?? { fileProvider: FileProvider.OsfStorage })
      .withParentRoute(dataRoute)
      .build();

    const defaultSignals: SignalOverride[] = [
      { selector: FilesSelectors.getFiles, value: [] },
      { selector: FilesSelectors.getFilesTotalCount, value: 0 },
      { selector: FilesSelectors.isFilesLoading, value: false },
      { selector: FilesSelectors.getCurrentFolder, value: currentFolder },
      { selector: FilesSelectors.getProvider, value: FileProvider.OsfStorage },
      { selector: CurrentResourceSelectors.getCurrentResource, value: currentResource },
      { selector: FilesSelectors.getRootFolders, value: [currentFolder] },
      { selector: FilesSelectors.isRootFoldersLoading, value: false },
      {
        selector: FilesSelectors.getConfiguredStorageAddons,
        value: [{ ...MOCK_CONFIGURED_ADDON, id: 'addon-1', externalServiceName: FileProvider.OsfStorage }],
      },
      { selector: FilesSelectors.isConfiguredStorageAddonsLoading, value: false },
      {
        selector: FilesSelectors.getStorageSupportedFeatures,
        value: { [FileProvider.OsfStorage]: [SupportedFeature.AddUpdateFiles] },
      },
      { selector: CurrentResourceSelectors.hasResourceWriteAccess, value: true },
      { selector: CurrentResourceSelectors.hasResourceAdminAccess, value: false },
    ];

    TestBed.configureTestingModule({
      imports: [
        FilesComponent,
        ...MockComponents(
          FilesTreeExplorerComponent,
          FormSelectComponent,
          GoogleFilePickerComponent,
          LoadingSpinnerComponent,
          SearchInputComponent,
          SubHeaderComponent,
          FileUploadDialogComponent,
          ViewOnlyLinkMessageComponent,
          FilesSelectionActionsComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute, routeMock),
        MockProvider(Router, routerMock),
        MockProvider(FilesService, filesService),
        MockProvider(ToastService, toastService),
        MockProvider(ViewOnlyLinkHelperService, viewOnlyHelper),
        MockProvider(CustomDialogService, customDialogService),
        MockProvider(DataciteService, dataciteService),
        MockProvider(FilesActionsService, filesActionsService),
        MockProvider(FilesTreeActionsService, filesTreeActionsService),
        MockProvider(FilesUploadService, filesUploadService),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
      ],
    });
    TestBed.overrideComponent(FilesComponent, {
      set: {
        providers: [
          MockProvider(FilesActionsService, filesActionsService),
          MockProvider(FilesUploadService, filesUploadService),
        ],
      },
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    component.currentRootFolder.set(rootFolderOption);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should dispatch resource and storage loading actions on init', () => {
    setup();
    const calls = (store.dispatch as Mock).mock.calls.map((c) => c[0]);

    expect(calls).toContainEqual(new GetResourceDetails('node-1', ResourceType.Project));
    expect(calls).toContainEqual(new GetRootFolders('node-1', ResourceType.Project));
    expect(calls).toContainEqual(new GetConfiguredStorageAddons('node-1'));
  });

  it('should call uploadFiles from tree upload confirm callback', () => {
    setup();
    const uploadSpy = vi.spyOn(component, 'uploadFiles').mockImplementation(() => {});
    const dropped = [new File(['a'], 'a.txt')];
    filesTreeActionsService.confirmDropFiles.mockImplementation((_files, onConfirm) => onConfirm());

    component.confirmTreeUpload(dropped);

    expect(filesTreeActionsService.confirmDropFiles).toHaveBeenCalledWith(dropped, expect.any(Function));
    expect(uploadSpy).toHaveBeenCalledWith(dropped);
  });

  it('should skip upload when selected file exceeds size limit', () => {
    setup();
    const uploadSpy = vi.spyOn(component, 'uploadFiles').mockImplementation(() => {});
    const big = new File(['x'], 'big.txt');
    Object.defineProperty(big, 'size', { value: 5 * 1024 * 1024 * 1024 });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [big] });

    component.onFileSelected({ target: input } as unknown as Event);

    expect(toastService.showWarn).toHaveBeenCalledWith('shared.files.limitText');
    expect(uploadSpy).not.toHaveBeenCalled();
  });

  it('should open move dialog and clear selection on success', () => {
    setup();
    const file = FileModelMock.simple({ id: 'file-1' });
    component.filesSelection = [file];
    (store.dispatch as Mock).mockClear();

    component.moveFiles([file], MoveCopyAction.Move);

    expect(store.dispatch).toHaveBeenCalledWith(new SetMoveDialogCurrentFolder(currentFolder));
    expect(filesActionsService.openMoveDialog).toHaveBeenCalled();
    expect(component.filesSelection).toEqual([]);
  });

  it('should confirm and delete entry through tree action service', () => {
    setup();
    const file = FileModelMock.simple({ id: 'f1', links: { ...FileModelMock.simple().links, delete: '/delete-link' } });
    (store.dispatch as Mock).mockClear();
    filesTreeActionsService.confirmDeleteEntry.mockImplementation((_file, onConfirm) => onConfirm());

    component.deleteEntry(file);

    expect(filesTreeActionsService.confirmDeleteEntry).toHaveBeenCalledWith(file, expect.any(Function));
    expect(store.dispatch).toHaveBeenCalledWith(new DeleteEntry('/delete-link'));
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.deleteFile.success');
  });

  it('should navigate to provider route when root folder changes', () => {
    setup();

    component.handleRootFolderChange(rootFolderOption);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/node-1/files', FileProvider.OsfStorage], {
      queryParamsHandling: 'preserve',
    });
  });
});
