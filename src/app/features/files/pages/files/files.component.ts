import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { debounceTime, distinctUntilChanged, finalize, map, of, tap } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  model,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FileUploadDialogComponent } from '@osf/shared/components/file-upload-dialog/file-upload-dialog.component';
import { FilesTreeComponent } from '@osf/shared/components/files-tree/files-tree.component';
import { FormSelectComponent } from '@osf/shared/components/form-select/form-select.component';
import { GoogleFilePickerComponent } from '@osf/shared/components/google-file-picker/google-file-picker.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SearchInputComponent } from '@osf/shared/components/search-input/search-input.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ViewOnlyLinkMessageComponent } from '@osf/shared/components/view-only-link-message/view-only-link-message.component';
import { FILE_SIZE_LIMIT } from '@osf/shared/constants/files-limits.const';
import { ALL_SORT_OPTIONS } from '@osf/shared/constants/sort-options.const';
import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { FileMenuType } from '@osf/shared/enums/file-menu-type.enum';
import { CurrentResourceType, ResourceType } from '@osf/shared/enums/resource-type.enum';
import { mapRootFoldersToStorageLabels } from '@osf/shared/helpers/storage-addon-options.helper';
import { FilePageLinkModel } from '@osf/shared/models/files/file-page-link.model';
import { RenamedFileLinkModel } from '@osf/shared/models/files/renamed-file-link.model';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';
import { CurrentResourceSelectors, GetResourceDetails } from '@osf/shared/stores/current-resource';
import { StorageItem } from '@shared/models/addons/storage-item.model';
import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';
import { FileLabelModel } from '@shared/models/files/file-label.model';
import { DataciteService } from '@shared/services/datacite/datacite.service';

import { FileBrowserInfoComponent } from '../../components/file-browser-info/file-browser-info.component';
import { FilesSelectionActionsComponent } from '../../components/files-selection-actions/files-selection-actions.component';
import { FileProvider } from '../../constants';
import { mapMenuActions } from '../../mappers/file-menu-actions.mapper';
import { FilesActionsService } from '../../services/files-actions.service';
import { FilesUploadService } from '../../services/files-upload.service';
import {
  CreateFolder,
  DeleteEntry,
  FilesSelectors,
  GetConfiguredStorageAddons,
  GetFiles,
  GetRootFolders,
  GetStorageSupportedFeatures,
  RenameEntry,
  ResetFilesState,
  SetCurrentProvider,
  SetFilesCurrentFolder,
  SetMoveDialogCurrentFolder,
  SetSearch,
  SetSort,
} from '../../store';

@Component({
  selector: 'osf-files',
  imports: [
    Button,
    TableModule,
    Select,
    FormsModule,
    ReactiveFormsModule,
    FilesTreeComponent,
    FormSelectComponent,
    GoogleFilePickerComponent,
    LoadingSpinnerComponent,
    SearchInputComponent,
    SubHeaderComponent,
    FileUploadDialogComponent,
    ViewOnlyLinkMessageComponent,
    FilesSelectionActionsComponent,
    TranslatePipe,
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FilesActionsService, FilesUploadService],
})
export class FilesComponent {
  googleFilePickerComponent = viewChild(GoogleFilePickerComponent);

  @HostBinding('class') classes = 'flex flex-column flex-1 w-full h-full';

  private readonly filesService = inject(FilesService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly dataciteService = inject(DataciteService);
  private readonly filesActionsService = inject(FilesActionsService);
  private readonly filesUploadService = inject(FilesUploadService);
  private readonly toastService = inject(ToastService);
  private readonly viewOnlyService = inject(ViewOnlyLinkHelperService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly actions = createDispatchMap({
    createFolder: CreateFolder,
    getFiles: GetFiles,
    deleteEntry: DeleteEntry,
    renameEntry: RenameEntry,
    setCurrentFolder: SetFilesCurrentFolder,
    setMoveDialogCurrentFolder: SetMoveDialogCurrentFolder,
    setSearch: SetSearch,
    setSort: SetSort,
    getRootFolders: GetRootFolders,
    getConfiguredStorageAddons: GetConfiguredStorageAddons,
    setCurrentProvider: SetCurrentProvider,
    resetState: ResetFilesState,
    getResourceDetails: GetResourceDetails,
    getStorageSupportedFeatures: GetStorageSupportedFeatures,
  });

  readonly files = select(FilesSelectors.getFiles);
  readonly filesTotalCount = select(FilesSelectors.getFilesTotalCount);
  readonly isFilesLoading = select(FilesSelectors.isFilesLoading);
  readonly currentFolder = select(FilesSelectors.getCurrentFolder);
  readonly provider = select(FilesSelectors.getProvider);
  readonly resourceMetadata = select(CurrentResourceSelectors.getCurrentResource);
  readonly rootFolders = select(FilesSelectors.getRootFolders);
  readonly isRootFoldersLoading = select(FilesSelectors.isRootFoldersLoading);
  readonly configuredStorageAddons = select(FilesSelectors.getConfiguredStorageAddons);
  readonly isConfiguredStorageAddonsLoading = select(FilesSelectors.isConfiguredStorageAddonsLoading);
  readonly supportedFeatures = select(FilesSelectors.getStorageSupportedFeatures);
  readonly hasWriteAccess = select(CurrentResourceSelectors.hasResourceWriteAccess);
  readonly hasAdminAccess = select(CurrentResourceSelectors.hasResourceAdminAccess);
  readonly currentResourceType = computed<CurrentResourceType>(
    () => (this.resourceMetadata()?.type as CurrentResourceType) ?? CurrentResourceType.Projects
  );

  readonly isGoogleDrive = signal<boolean>(false);
  readonly accountId = signal<string>('');
  readonly selectedRootFolder = signal<StorageItem>({});
  readonly resourceId = signal<string>('');

  readonly progress = signal(0);
  readonly fileName = signal('');
  readonly dataLoaded = signal(false);
  readonly searchControl = new FormControl<string>('');
  readonly sortControl = new FormControl(ALL_SORT_OPTIONS[0].value);

  foldersStack = [] as FileFolderModel[];

  currentRootFolder = model<FileLabelModel | null>(null);

  fileIsUploading = signal(false);
  isMoveDialogOpened = signal(false);

  sortOptions = ALL_SORT_OPTIONS;

  pageNumber = signal(1);

  allowRevisions = false;
  filesSelection: FileModel[] = [];

  readonly allowedMenuActions = computed(() => {
    const provider = this.provider();
    const supportedFeatures = this.supportedFeatures()[provider] || [];
    const hasViewOnly = this.hasViewOnly();
    const isRegistration = this.resourceType() === ResourceType.Registration;
    const menuMap = mapMenuActions(supportedFeatures);

    const result: Record<FileMenuType, boolean> = { ...menuMap };

    if (hasViewOnly || isRegistration || !this.canEdit()) {
      const allowed = new Set<FileMenuType>([FileMenuType.Download, FileMenuType.Embed, FileMenuType.Share]);

      (Object.keys(result) as FileMenuType[]).forEach((key) => {
        result[key] = allowed.has(key) && menuMap[key];
      });
    }

    return result;
  });

  readonly rootFoldersOptions = computed(() => {
    const osfLabel = this.translateService.instant('files.storageLocation');
    return mapRootFoldersToStorageLabels(this.rootFolders(), this.configuredStorageAddons(), osfLabel);
  });

  resourceType = signal<ResourceType>(
    this.activeRoute.parent?.parent?.snapshot.data['resourceType'] || ResourceType.Project
  );

  readonly hasViewOnly = computed(() => this.viewOnlyService.hasViewOnlyParam(this.router));
  readonly canEdit = computed(() => this.hasWriteAccess() || this.hasAdminAccess());
  readonly isRegistration = computed(() => this.resourceType() === ResourceType.Registration);

  canUploadFiles = computed(
    () =>
      this.supportedFeatures()[this.provider()]?.includes(SupportedFeature.AddUpdateFiles) &&
      this.canEdit() &&
      !this.isRegistration()
  );

  isButtonDisabled = computed(() => this.fileIsUploading() || this.isFilesLoading());

  isGoogleDriveButtonDisabled = computed(
    () => this.isButtonDisabled() || (this.googleFilePickerComponent()?.isGFPDisabled() ?? false)
  );

  readonly providerName = toSignal(
    this.activeRoute?.params?.pipe(map((params) => params['fileProvider'])) ?? of('osfstorage')
  );

  constructor() {
    this.initResourceId();
    this.initEffects();
    this.initFilters();
    this.initDestroyHandler();
  }

  private initResourceId(): void {
    this.activeRoute.parent?.parent?.parent?.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['id']) {
        this.resourceId.set(params['id']);
      }
    });
  }

  private initEffects(): void {
    effect(() => {
      const resourceId = this.resourceId();
      if (!resourceId) return;

      this.actions.getResourceDetails(resourceId, this.resourceType());
      this.actions.getRootFolders(resourceId, this.resourceType());
      this.actions.getConfiguredStorageAddons(resourceId);
    });

    effect(() => {
      const rootFoldersOptions = this.rootFoldersOptions();
      const providerName = this.providerName();

      if (rootFoldersOptions && rootFoldersOptions.length && providerName) {
        const rootFoldersOption = rootFoldersOptions.find((option) => option.folder.provider === providerName);

        if (!rootFoldersOption) {
          this.router.navigate([`/${this.resourceId()}/files`, FileProvider.OsfStorage], {
            queryParamsHandling: 'preserve',
          });
        } else {
          this.currentRootFolder.set({
            label: rootFoldersOption.label,
            folder: rootFoldersOption.folder,
          });
        }
      }
    });

    effect(() => {
      const currentRootFolder = this.currentRootFolder();
      if (currentRootFolder) {
        const provider = currentRootFolder.folder?.provider;
        const storageId = currentRootFolder.folder?.id;
        this.allowRevisions = provider === FileProvider.OsfStorage;
        this.isGoogleDrive.set(provider === FileProvider.GoogleDrive);
        if (this.isGoogleDrive()) {
          this.setGoogleAccountId();
        }
        if (storageId) {
          this.actions.getStorageSupportedFeatures(storageId, provider);
        }
        this.actions.setCurrentProvider(provider ?? FileProvider.OsfStorage);
        this.actions.setCurrentFolder(currentRootFolder.folder);
        this.filesSelection = [];
      }
    });

    effect(() => {
      if (!this.isConfiguredStorageAddonsLoading() && !this.isRootFoldersLoading()) {
        this.dataLoaded.set(true);
      }
    });

    effect(() => {
      const currentFolder = this.currentFolder();
      if (currentFolder) {
        this.pageNumber.set(1);
        this.updateFilesList();
      }
    });
  }

  private initFilters(): void {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged(), debounceTime(500))
      .subscribe((searchText) => {
        this.actions.setSearch(searchText ?? '');

        this.updateFilesList();
      });

    this.sortControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sort) => {
      this.actions.setSort(sort ?? '');

      this.updateFilesList();
    });
  }

  private initDestroyHandler(): void {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser) {
        this.actions.resetState();
      }
    });
  }

  onLoadFiles(event: FilePageLinkModel) {
    this.actions.getFiles(event.link, event.page);
  }

  uploadFiles(files: File | File[]): void {
    const uploadLink = this.currentFolder()?.links.upload;
    if (!uploadLink) return;

    this.filesUploadService.uploadFiles({
      files,
      uploadLink,
      allowRevisions: this.allowRevisions,
      onStart: (fileName) => {
        this.fileName.set(fileName);
        this.fileIsUploading.set(true);
        this.progress.set(0);
      },
      onProgress: (progress) => {
        this.progress.set(progress);
      },
      onComplete: () => {
        this.fileIsUploading.set(false);
        this.fileName.set('');
        this.updateFilesList();
      },
    });
  }

  onFileTreeSelected(file: FileModel): void {
    if (this.filesSelection.some((selectedFile) => selectedFile.id === file.id)) {
      return;
    }

    this.filesSelection = [...this.filesSelection, file];
  }

  onFileTreeUnselected(file: FileModel): void {
    this.filesSelection = this.filesSelection.filter((f) => f.id !== file.id);
  }

  onClearSelection(): void {
    this.filesSelection = [];
  }

  onDeleteSelected(): void {
    this.filesActionsService.deleteSelected({
      files: this.filesSelection,
      deleteEntry: (link) => this.actions.deleteEntry(link),
      onSuccess: () => {
        this.filesSelection = [];
        this.updateFilesList();
      },
    });
  }

  onMoveSelected(): void {
    this.moveFiles(this.filesSelection, 'move');
  }

  onCopySelected(): void {
    this.moveFiles(this.filesSelection, 'copy');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    for (const file of files) {
      if (file.size >= FILE_SIZE_LIMIT) {
        this.toastService.showWarn('shared.files.limitText');
        return;
      }
    }

    this.uploadFiles(Array.from(files));
  }

  moveFiles(files: FileModel[], action: 'move' | 'copy'): void {
    const currentFolder = this.currentFolder();
    this.actions.setMoveDialogCurrentFolder(currentFolder);
    this.isMoveDialogOpened.set(true);

    this.filesActionsService
      .openMoveDialog({
        files,
        action,
        resourceId: this.resourceId(),
        storageProvider: this.provider(),
        foldersStack: this.foldersStack,
        initialFolder: currentFolder,
      })
      .pipe(
        tap((result) => {
          if (result) {
            this.filesSelection = [];
          }
          this.isMoveDialogOpened.set(false);
          this.resetProvider();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  resetProvider() {
    const currentRootFolder = this.currentRootFolder();
    const provider = currentRootFolder?.folder?.provider;
    if (provider) {
      this.actions.setCurrentProvider(provider);
    }
  }

  resetOnDialogClose(): void {
    this.onClearSelection();
    this.resetProvider();
    this.updateFilesList();
  }

  createFolder(): void {
    const currentFolder = this.currentFolder();
    const newFolderLink = currentFolder?.links.newFolder;

    if (!newFolderLink) return;

    this.filesActionsService
      .openCreateFolderDialog({
        newFolderLink,
        createFolder: (link, folderName) => this.actions.createFolder(link, folderName),
      })
      .pipe(
        tap(() => this.toastService.showSuccess('files.dialogs.createFolder.success')),
        finalize(() => {
          this.updateFilesList();
          this.fileIsUploading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  downloadFolder(): void {
    const resourceId = this.resourceId();
    const resourcePath = this.resourceMetadata()?.type ?? 'nodes';
    const downloadLink = this.currentFolder()?.links.download ?? '';
    if (resourceId && downloadLink) {
      this.dataciteService
        .logFileDownload(resourceId, resourcePath)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
      const link = this.filesService.getFolderDownloadLink(downloadLink);
      window.open(link, '_blank')?.focus();
    }
  }

  showInfoDialog() {
    this.customDialogService.open(FileBrowserInfoComponent, {
      header: 'files.filesBrowserDialog.title',
      width: '850px',
      data: this.resourceType(),
    });
  }

  updateFilesList = (): void => {
    const currentFolder = this.currentFolder();
    const filesLink = currentFolder?.links.filesLink;
    if (filesLink) {
      this.actions.getFiles(filesLink, this.pageNumber());
    }
  };

  setCurrentFolder(folder: FileFolderModel) {
    this.actions.setCurrentFolder(folder);
  }

  setMoveDialogCurrentFolder(folder: FileFolderModel) {
    this.actions.setMoveDialogCurrentFolder(folder);
  }

  deleteEntry(file: FileModel): void {
    this.actions.deleteEntry(file?.links.delete).subscribe(() => {
      this.toastService.showSuccess('files.dialogs.deleteFile.success');
      this.updateFilesList();
    });
  }

  renameEntry(event: RenamedFileLinkModel) {
    const { newName, link } = event;
    this.actions.renameEntry(link, newName).subscribe(() => {
      this.toastService.showSuccess('files.dialogs.renameFile.success');
      this.updateFilesList();
    });
  }

  navigateToFile(file: FileModel) {
    if (file.guid) {
      this.openFile(file.guid);
      return;
    }

    this.filesService.getFileGuid(file.id).subscribe((file) => {
      if (file.guid) {
        this.openFile(file.guid);
      }
    });
  }

  handleRootFolderChange(selectedFolder: FileLabelModel) {
    const provider = selectedFolder.folder?.provider;
    const resourceId = this.resourceId();
    this.router.navigate([`/${resourceId}/files`, provider], { queryParamsHandling: 'preserve' });
  }

  private openFile(guid: string): void {
    const extras = this.hasViewOnly()
      ? { queryParams: { view_only: this.viewOnlyService.getViewOnlyParamFromUrl(this.router.url) } }
      : undefined;

    window.open(this.router.serializeUrl(this.router.createUrlTree(['/', guid], extras)), '_blank');
  }

  private setGoogleAccountId(): void {
    const addons = this.configuredStorageAddons();
    const googleDrive = addons?.find((addon) => addon.externalServiceName === FileProvider.GoogleDrive);
    if (googleDrive) {
      this.accountId.set(googleDrive.baseAccountId);
      this.selectedRootFolder.set({ itemId: googleDrive.selectedStorageItemId });
    }
  }
}
