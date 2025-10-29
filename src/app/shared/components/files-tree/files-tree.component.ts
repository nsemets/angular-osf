import { select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { PrimeTemplate } from 'primeng/api';
import { Tree, TreeNodeSelectEvent, TreeScrollIndexChangeEvent } from 'primeng/tree';

import { Clipboard } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { MoveFileDialogComponent } from '@osf/features/files/components/move-file-dialog/move-file-dialog.component';
import { RenameFileDialogComponent } from '@osf/features/files/components/rename-file-dialog/rename-file-dialog.component';
import { embedDynamicJs, embedStaticHtml } from '@osf/features/files/constants';
import { StopPropagationDirective } from '@osf/shared/directives/stop-propagation.directive';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileMenuType } from '@osf/shared/enums/file-menu-type.enum';
import { hasViewOnlyParam } from '@osf/shared/helpers/view-only.helper';
import { FilesMapper } from '@osf/shared/mappers/files/files.mapper';
import { FileSizePipe } from '@osf/shared/pipes/file-size.pipe';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { DataciteService } from '@osf/shared/services/datacite/datacite.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';
import { FileLabelModel } from '@shared/models/files/file-label.model';
import { FileMenuAction, FileMenuFlags } from '@shared/models/files/file-menu-action.model';
import { CurrentResourceSelectors } from '@shared/stores/current-resource';

import { FileMenuComponent } from '../file-menu/file-menu.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'osf-files-tree',
  imports: [
    DatePipe,
    FileSizePipe,
    PrimeTemplate,
    TranslatePipe,
    Tree,
    LoadingSpinnerComponent,
    FileMenuComponent,
    StopPropagationDirective,
  ],
  templateUrl: './files-tree.component.html',
  styleUrl: './files-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeComponent implements OnDestroy, AfterViewInit {
  @HostBinding('class') classes = 'relative';
  private dropZoneContainerRef = viewChild<ElementRef>('dropZoneContainer');
  readonly filesService = inject(FilesService);
  readonly router = inject(Router);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly customConfirmationService = inject(CustomConfirmationService);
  readonly customDialogService = inject(CustomDialogService);
  readonly dataciteService = inject(DataciteService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly environment = inject(ENVIRONMENT);
  readonly clipboard = inject(Clipboard);

  files = input.required<FileModel[]>();
  totalCount = input<number>(0);
  isLoading = input<boolean>();
  currentFolder = input.required<FileFolderModel>();
  storage = input.required<FileLabelModel | null>();
  resourceId = input.required<string>();
  viewOnly = input<boolean>(true);
  provider = input<string>();
  allowedMenuActions = input<FileMenuFlags>({} as FileMenuFlags);
  supportUpload = input<boolean>(true);
  selectedFiles = input<FileModel[]>([]);
  scrollHeight = input<string>('300px');
  selectionMode = input<'multiple' | null>('multiple');

  entryFileClicked = output<FileModel>();
  uploadFilesConfirmed = output<File[] | File>();
  setCurrentFolder = output<FileFolderModel>();
  setMoveDialogCurrentFolder = output<FileFolderModel>();
  deleteEntryAction = output<string>();
  renameEntryAction = output<{ newName: string; link: string }>();
  loadFiles = output<{ link: string; page: number }>();
  selectFile = output<FileModel>();
  unselectFile = output<FileModel>();
  clearSelection = output<void>();
  updateFoldersStack = output<FileFolderModel[]>();
  resetFilesProvider = output<void>();

  readonly resourceMetadata = select(CurrentResourceSelectors.getCurrentResource);

  foldersStack: FileFolderModel[] = [];
  itemsPerPage = 10;
  virtualScrollItemSize = 46;

  isDragOver = signal(false);
  isLoadingMore = signal(false);

  hasViewOnly = computed(() => hasViewOnlyParam(this.router) || this.viewOnly());
  visibleFilesCount = computed((): number => {
    const height = parseInt(this.scrollHeight(), 10);
    return Math.ceil(height / this.virtualScrollItemSize);
  });

  get isSomeFileActionAllowed(): boolean {
    return Object.keys(this.allowedMenuActions()).length > 0;
  }

  readonly nodes = computed(() => {
    const currentFolder = this.currentFolder();
    const files = this.files();
    const hasParent = this.foldersStack.length > 0;
    if (hasParent) {
      return [
        {
          ...currentFolder,
          previousFolder: hasParent,
        },
        ...files,
      ] as FileModel[];
    } else {
      return [...files];
    }
  });

  constructor() {
    effect(() => {
      const storageChanged = this.storage();
      if (storageChanged) {
        this.foldersStack = [];
        this.updateFoldersStack.emit(this.foldersStack);
      }
    });

    effect(() => {
      if (!this.isLoading()) {
        this.isLoadingMore.set(false);
      }
    });

    effect(() => {
      const loaded = this.files().length;
      if (loaded < this.visibleFilesCount()) {
        this.loadNextPage();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.viewOnly()) {
      this.dropZoneContainerRef()?.nativeElement?.addEventListener('dragenter', this.dragEnterHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.dropZoneContainerRef()?.nativeElement) {
      this.dropZoneContainerRef()!.nativeElement.removeEventListener('dragenter', this.dragEnterHandler);
    }
  }

  private dragEnterHandler = (event: DragEvent) => {
    if (event.dataTransfer?.types?.includes('Files') && !this.viewOnly()) {
      this.isDragOver.set(true);
    }
  };

  onDragOver(event: DragEvent) {
    if (this.viewOnly()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
    this.isDragOver.set(true);
  }

  onDragLeave(event: Event) {
    if (this.viewOnly()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (this.viewOnly()) {
      return;
    }

    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const isMultiple = files.length > 1;

      this.customConfirmationService.confirmAccept({
        headerKey: isMultiple ? 'files.dialogs.uploadFiles.title' : 'files.dialogs.uploadFile.title',
        messageParams: isMultiple ? { count: files.length } : { name: files[0].name },
        messageKey: isMultiple ? 'files.dialogs.uploadFiles.message' : 'files.dialogs.uploadFile.message',
        acceptLabelKey: 'common.buttons.upload',
        onConfirm: () => this.uploadFilesConfirmed.emit(fileArray),
      });
    }
  }

  openEntry(event: Event, file: FileModel | FileFolderModel) {
    event.stopPropagation();
    if (file.kind === FileKind.File) {
      if (file.guid) {
        this.entryFileClicked.emit(file);
      } else {
        this.filesService.getFileGuid(file.id).subscribe((file) => {
          this.entryFileClicked.emit(file);
        });
      }
    } else {
      const current = this.currentFolder();
      if (current) {
        this.foldersStack.push(current);
        this.updateFoldersStack.emit(this.foldersStack);
      }
      const folder = FilesMapper.mapFileToFolder(file as FileModel);
      this.setCurrentFolder.emit(folder);
      this.clearSelection.emit();
    }
  }

  openParentFolder() {
    const previous = this.foldersStack.pop();
    this.updateFoldersStack.emit(this.foldersStack);
    if (previous) {
      this.setCurrentFolder.emit(previous);
    }
    this.clearSelection.emit();
  }

  onFileMenuAction(action: FileMenuAction, file: FileModel): void {
    const { value, data } = action;

    switch (value) {
      case FileMenuType.Download:
        this.downloadFileOrFolder(file);
        break;
      case FileMenuType.Delete:
        this.deleteEntry(file);
        break;
      case FileMenuType.Share:
        this.handleShareAction(file, data?.type);
        break;
      case FileMenuType.Embed:
        this.handleEmbedAction(file, data?.type);
        break;
      case FileMenuType.Rename:
        this.confirmRename(file);
        break;
      case FileMenuType.Move:
        this.moveFile(file, FileMenuType.Move);
        break;
      case FileMenuType.Copy:
        this.moveFile(file, FileMenuType.Copy);
        break;
    }
  }

  downloadFileOrFolder(file: FileModel) {
    const resourceType = this.resourceMetadata()?.type ?? 'nodes';
    this.dataciteService
      .logFileDownload(this.resourceId(), resourceType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    if (file.kind === FileKind.File) {
      this.downloadFile(file.links.download);
    } else {
      const folder = FilesMapper.mapFileToFolder(file as FileModel);
      this.downloadFolder(folder.links.download);
    }
  }

  private handleShareAction(file: FileModel, shareType?: string): void {
    const emailLink = `mailto:?subject=${file.name}&body=${file.links.html}`;
    const twitterLink = `https://twitter.com/intent/tweet?url=${file.links.html}&text=${file.name}&via=OSFramework`;
    const facebookLink = `https://www.facebook.com/dialog/share?app_id=${this.environment.facebookAppId}&display=popup&href=${file.links.html}&redirect_uri=${file.links.html}`;

    switch (shareType) {
      case 'email':
        this.openLink(emailLink);
        break;
      case 'twitter':
        this.openLinkNewTab(twitterLink);
        break;
      case 'facebook':
        this.openLinkNewTab(facebookLink);
        break;
    }
  }

  private handleEmbedAction(file: FileModel, embedType?: string): void {
    let embedHtml = '';
    if (embedType === 'dynamic') {
      embedHtml = embedDynamicJs.replace('ENCODED_URL', file.links.render);
    } else if (embedType === 'static') {
      embedHtml = embedStaticHtml.replace('ENCODED_URL', file.links.render);
    }

    if (embedHtml) {
      this.copyToClipboard(embedHtml);
    }
  }

  deleteEntry(file: FileModel): void {
    this.customConfirmationService.confirmDelete({
      headerKey: file.kind === FileKind.Folder ? 'files.dialogs.deleteFolder.title' : 'files.dialogs.deleteFile.title',
      messageParams: { name: file.name },
      messageKey:
        file.kind === FileKind.Folder ? 'files.dialogs.deleteFolder.message' : 'files.dialogs.deleteFile.message',
      acceptLabelKey: 'common.buttons.remove',
      onConfirm: () => this.confirmDeleteEntry(file.links.delete),
    });
  }

  confirmDeleteEntry(link: string): void {
    this.deleteEntryAction.emit(link);
  }

  confirmRename(file: FileModel): void {
    this.customDialogService
      .open(RenameFileDialogComponent, {
        header: 'files.dialogs.renameFile.title',
        width: '448px',
        data: {
          currentName: file.name,
        },
      })
      .onClose.subscribe((newName: string) => {
        if (newName) {
          this.renameEntry(newName, file);
        }
      });
  }

  renameEntry(newName: string, file: FileModel): void {
    if (newName.trim() && file.links.upload) {
      const link = file.links.upload;
      this.renameEntryAction.emit({ newName, link });
    }
  }

  downloadFile(link: string): void {
    window.open(link)?.focus();
  }

  openLink(link: string): void {
    window.location.href = link;
  }

  openLinkNewTab(link: string): void {
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  downloadFolder(downloadLink: string): void {
    if (downloadLink) {
      const link = this.filesService.getFolderDownloadLink(downloadLink);
      window.open(link, '_blank')?.focus();
    }
  }

  moveFile(file: FileModel, action: string): void {
    this.setMoveDialogCurrentFolder.emit(this.currentFolder());
    this.customDialogService
      .open(MoveFileDialogComponent, {
        header: 'files.dialogs.moveFile.title',
        width: '552px',
        data: {
          files: [file],
          resourceId: this.resourceId(),
          action: action,
          storageProvider: this.storage()?.folder.provider,
          foldersStack: structuredClone(this.foldersStack),
          initialFolder: structuredClone(this.currentFolder()),
        },
      })
      .onClose.subscribe(() => {
        this.resetFilesProvider.emit();
      });
  }

  copyToClipboard(embedHtml: string): void {
    this.clipboard.copy(embedHtml);
    this.toastService.showSuccess('files.detail.toast.copiedToClipboard');
  }

  private loadNextPage(): void {
    const total = this.totalCount();
    const loaded = this.files().length;
    const nextPage = Math.floor(loaded / this.itemsPerPage) + 1;

    if (!this.isLoadingMore() && loaded < total) {
      this.isLoadingMore.set(true);
      this.loadFiles.emit({
        link: this.currentFolder()?.links.filesLink ?? '',
        page: nextPage,
      });
    }
  }

  onScrollIndexChange(event: TreeScrollIndexChangeEvent) {
    const loaded = this.files().length;
    if (event.last >= loaded - 1) {
      this.loadNextPage();
    }
  }

  onNodeSelect(event: TreeNodeSelectEvent) {
    this.selectFile.emit(event.node as FileModel);
  }

  onNodeUnselect(event: TreeNodeSelectEvent) {
    this.unselectFile.emit(event.node as FileModel);
  }
}
