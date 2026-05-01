import { select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { PrimeTemplate, TreeNode } from 'primeng/api';
import { Tree, TreeLazyLoadEvent, TreeNodeDropEvent, TreeNodeSelectEvent } from 'primeng/tree';

import { filter } from 'rxjs';

import { DatePipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ConfirmMoveFileDialogComponent } from '@osf/features/files/components/confirm-move-file-dialog/confirm-move-file-dialog.component';
import { MoveFileDialogComponent } from '@osf/features/files/components/move-file-dialog/move-file-dialog.component';
import { RenameFileDialogComponent } from '@osf/features/files/components/rename-file-dialog/rename-file-dialog.component';
import { StopPropagationDirective } from '@osf/shared/directives/stop-propagation.directive';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileMenuType } from '@osf/shared/enums/file-menu-type.enum';
import { FilesMapper } from '@osf/shared/mappers/files/files.mapper';
import { FilePageLinkModel } from '@osf/shared/models/files/file-page-link.model';
import { RenamedFileLinkModel } from '@osf/shared/models/files/renamed-file-link.model';
import { FileSizePipe } from '@osf/shared/pipes/file-size.pipe';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { DataciteService } from '@osf/shared/services/datacite/datacite.service';
import { FilesService } from '@osf/shared/services/files.service';
import { FilesShareEmbedService } from '@osf/shared/services/files-share-embed.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';
import { CurrentResourceSelectors } from '@osf/shared/stores/current-resource';
import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';
import { FileLabelModel } from '@shared/models/files/file-label.model';
import { FileMenuAction, FileMenuFlags } from '@shared/models/files/file-menu-action.model';

import { FileMenuComponent } from '../file-menu/file-menu.component';
import { FilesDropZoneComponent } from '../files-drop-zone/files-drop-zone.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

// [NS] Temporary fix
type FileTreeNode = FileModel & TreeNode;

@Component({
  selector: 'osf-files-tree',
  imports: [
    DatePipe,
    FileSizePipe,
    PrimeTemplate,
    TranslatePipe,
    Tree,
    LoadingSpinnerComponent,
    FilesDropZoneComponent,
    FileMenuComponent,
    StopPropagationDirective,
  ],
  templateUrl: './files-tree.component.html',
  styleUrl: './files-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeComponent {
  @HostBinding('class') classes = 'relative';
  readonly filesService = inject(FilesService);
  readonly router = inject(Router);
  readonly toastService = inject(ToastService);
  readonly customConfirmationService = inject(CustomConfirmationService);
  readonly customDialogService = inject(CustomDialogService);
  readonly dataciteService = inject(DataciteService);
  readonly filesShareEmbedService = inject(FilesShareEmbedService);
  private readonly viewOnlyService = inject(ViewOnlyLinkHelperService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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
  renameEntryAction = output<RenamedFileLinkModel>();
  loadFiles = output<FilePageLinkModel>();
  selectFile = output<FileModel>();
  unselectFile = output<FileModel>();
  clearSelection = output<void>();
  updateFoldersStack = output<FileFolderModel[]>();
  resetFilesProvider = output<void>();

  readonly resourceMetadata = select(CurrentResourceSelectors.getCurrentResource);

  foldersStack: FileFolderModel[] = [];
  lastSelectedFile: FileModel | null = null;
  itemsPerPage = 10;
  virtualScrollItemSize = 46;

  isLoadingMore = signal(false);

  hasViewOnly = computed(() => this.viewOnlyService.hasViewOnlyParam(this.router) || this.viewOnly());
  canShowMenu = computed(() => Object.keys(this.allowedMenuActions()).length > 0 && !this.selectedFiles().length);

  readonly nodes = computed(() => {
    const currentFolder = this.currentFolder();
    const files = this.files();

    if (this.foldersStack.length === 0) {
      return files;
    }

    return [{ ...currentFolder, previousFolder: true }, ...files] as FileModel[];
  });

  // [NS] Temporary fix
  readonly selectedNodes = computed(() => this.selectedFiles() as FileTreeNode[]);

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
  }

  onDropFiles(fileArray: File[]): void {
    if (!fileArray.length) {
      return;
    }

    const isMultiple = fileArray.length > 1;

    this.customConfirmationService.confirmAccept({
      headerKey: isMultiple ? 'files.dialogs.uploadFiles.title' : 'files.dialogs.uploadFile.title',
      messageParams: isMultiple ? { count: fileArray.length } : { name: fileArray[0].name },
      messageKey: isMultiple ? 'files.dialogs.uploadFiles.message' : 'files.dialogs.uploadFile.message',
      acceptLabelKey: 'common.buttons.upload',
      onConfirm: () => this.uploadFilesConfirmed.emit(fileArray),
    });
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
      this.downloadFolder(file.links.upload);
    }
  }

  private handleShareAction(file: FileModel, shareType?: string): void {
    const shareAction = this.filesShareEmbedService.getShareLink(file, shareType);
    if (!shareAction || !this.isBrowser) {
      return;
    }

    if (shareAction.target === '_self') {
      window.location.href = shareAction.link;
      return;
    }

    window.open(shareAction.link, shareAction.target, 'noopener,noreferrer');
  }

  private handleEmbedAction(file: FileModel, embedType?: string): void {
    const embedHtml = this.filesShareEmbedService.getEmbedHtml(file, embedType);

    if (!embedHtml) {
      return;
    }

    const copied = this.filesShareEmbedService.copyToClipboard(embedHtml);

    if (copied) {
      this.toastService.showSuccess('files.detail.toast.copiedToClipboard');
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
        data: { currentName: file.name },
      })
      .onClose.pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((newName: string) => !!newName)
      )
      .subscribe((newName) => this.renameEntry(newName, file));
  }

  renameEntry(newName: string, file: FileModel): void {
    if (newName.trim() && file.links.upload) {
      const link = file.links.upload;
      this.renameEntryAction.emit({ newName, link });
    }
  }

  downloadFile(link: string): void {
    if (this.isBrowser) {
      window.open(link)?.focus();
    }
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

  private loadNextPage(): void {
    const total = this.totalCount();
    const loaded = this.files().length;
    const nextPage = Math.floor(loaded / this.itemsPerPage) + 1;

    if (!this.isLoadingMore() && loaded < total) {
      this.isLoadingMore.set(true);
      this.loadFiles.emit({ link: this.currentFolder()?.links.filesLink ?? '', page: nextPage });
    }
  }

  onLazyLoad(event: TreeLazyLoadEvent) {
    const loaded = this.files().length;
    if (event.last >= loaded - 1) {
      this.loadNextPage();
    }
  }

  onNodeSelect(event: TreeNodeSelectEvent) {
    const files = this.files();
    const selectedNode = event.node as FileModel;
    if ((event.originalEvent as PointerEvent).shiftKey && this.lastSelectedFile) {
      const lastIndex = files.indexOf(this.lastSelectedFile);
      const currentIndex = files.indexOf(selectedNode);
      if (lastIndex == currentIndex) {
        return;
      }

      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);

      for (const file of files.slice(start, end)) {
        this.selectFile.emit(file);
      }
    }
    this.selectFile.emit(selectedNode);
    this.lastSelectedFile = selectedNode;
  }

  onNodeDrop(event: TreeNodeDropEvent) {
    const dropFile = event.dropNode as FileModel;
    if (dropFile.kind !== FileKind.Folder) {
      return;
    }
    const files = this.selectedFiles();
    const dragFile = event.dragNode as FileModel;
    if (!files.includes(dragFile)) {
      this.selectFile.emit(dragFile);
    }
    this.moveFilesTo(files, dropFile);
  }

  onNodeUnselect(event: TreeNodeSelectEvent) {
    this.unselectFile.emit(event.node as FileModel);
  }

  private moveFilesTo(files: FileModel[], destination: FileModel) {
    const isMultiple = files.length > 1;
    this.customDialogService
      .open(ConfirmMoveFileDialogComponent, {
        header: isMultiple ? 'files.dialogs.moveFile.dialogTitleMultiple' : 'files.dialogs.moveFile.dialogTitle',
        width: '552px',
        data: {
          files,
          destination,
          resourceId: this.resourceId(),
          storageProvider: this.storage()?.folder.provider,
        },
      })
      .onClose.subscribe(() => {
        this.resetFilesProvider.emit();
      });
  }
}
