import { select, Store } from '@ngxs/store';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';
import { Popover } from 'primeng/popover';
import { Tree, TreeNodeDropEvent } from 'primeng/tree';

import { finalize, firstValueFrom, forkJoin, take } from 'rxjs';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MoveFileDialogComponent } from '@osf/features/project/files/components';
import { RenameFileDialogComponent } from '@osf/features/project/files/components/rename-file-dialog/rename-file-dialog.component';
import { FILE_MENU_ITEMS, FILE_SORT_OPTIONS } from '@osf/features/project/files/constants';
import {
  embedDynamicJs,
  embedStaticHtml,
  FileMenuItems,
  OsfFile,
  FilesTreeActions,
} from '@osf/features/project/files/models';
import { ProjectFilesService } from '@osf/features/project/files/services';
import { ProjectFilesSelectors } from '@osf/features/project/files/store';
import { FileSizePipe } from '@shared/pipes';
import { ToastService } from '@shared/services';
import { defaultConfirmationConfig } from '@shared/utils';

@Component({
  selector: 'osf-files-tree',
  imports: [Button, DatePipe, FileSizePipe, Menu, Popover, PrimeTemplate, TranslateModule, Tree],
  templateUrl: './files-tree.component.html',
  styleUrl: './files-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeComponent {
  readonly store = inject(Store);
  readonly projectFilesService = inject(ProjectFilesService);
  readonly router = inject(Router);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly confirmationService = inject(ConfirmationService);
  readonly dialogService = inject(DialogService);
  readonly translateService = inject(TranslateService);

  searchControl = input.required<FormControl>();
  sortControl = input.required<FormControl>();
  projectId = input.required<string>();
  actions = input.required<FilesTreeActions>();
  readonly = input.required<boolean>();

  protected readonly files = select(ProjectFilesSelectors.getFiles);
  protected readonly currentFolder = select(ProjectFilesSelectors.getCurrentFolder);
  protected readonly nodes = computed(() => {
    if (this.currentFolder()?.relationships?.parentFolderLink) {
      return [
        {
          ...this.currentFolder(),
          previousFolder: true,
        },
        ...this.files().data,
      ] as OsfFile[];
    } else {
      return this.files().data;
    }
  });

  protected readonly fileName = signal('');

  dialogRef: DynamicDialogRef | null = null;

  items = FILE_MENU_ITEMS;
  dynamicHtml = embedDynamicJs;
  staticHtml = embedStaticHtml;

  readonly isBatching = signal(false);

  protected readonly FileMenuItems = FileMenuItems;

  openEntry(file: OsfFile) {
    if (file.kind === 'file') {
      this.router.navigate([file.guid], { relativeTo: this.route });
    } else {
      this.actions().setFilesIsLoading(true);
      this.isBatching.set(true);

      forkJoin([
        this.actions().setCurrentFolder(file),
        this.actions().setSearch(''),
        this.actions().setSort(FILE_SORT_OPTIONS[0].value),
      ])
        .pipe(take(1))
        .subscribe(() => {
          this.searchControl().setValue('');
          this.sortControl().setValue(FILE_SORT_OPTIONS[0].value);
          this.isBatching.set(false);
          this.updateFilesList();
        });
    }
  }

  openParentFolder() {
    const currentFolder = this.currentFolder();

    if (!currentFolder) return;

    this.actions().setFilesIsLoading(true);
    this.isBatching.set(true);

    this.projectFilesService
      .getFolder(currentFolder.relationships.parentFolderLink)
      .pipe(take(1))
      .subscribe((folder) => {
        forkJoin([
          this.actions().setCurrentFolder(folder),
          this.actions().setSearch(''),
          this.actions().setSort(FILE_SORT_OPTIONS[0].value),
        ])
          .pipe(take(1))
          .subscribe(() => {
            this.searchControl().setValue('');
            this.sortControl().setValue(FILE_SORT_OPTIONS[0].value);
            this.isBatching.set(false);
            this.updateFilesList();
          });
      });
  }

  confirmDelete(file: OsfFile): void {
    this.confirmationService.confirm({
      ...defaultConfirmationConfig,
      header: this.translateService.instant('project.files.dialogs.deleteFile.title'),
      message: this.translateService.instant('project.files.dialogs.deleteFile.message', { name: file.name }),
      acceptButtonProps: {
        ...defaultConfirmationConfig.acceptButtonProps,
        label: this.translateService.instant('common.buttons.delete'),
        severity: 'danger',
      },
      accept: () => {
        this.deleteEntry(file.links.delete);
      },
    });
  }

  deleteEntry(link: string): void {
    this.actions().setFilesIsLoading(true);
    this.actions()
      .deleteEntry(this.projectId(), link)
      .pipe(take(1))
      .subscribe();
  }

  confirmRename(file: OsfFile): void {
    this.dialogRef = this.dialogService.open(RenameFileDialogComponent, {
      width: '448px',
      focusOnShow: false,
      header: this.translateService.instant('project.files.dialogs.renameFile.title'),
      closeOnEscape: true,
      modal: true,
      closable: true,
      data: {
        currentName: file.name,
      },
    });

    this.dialogRef.onClose.subscribe((newName: string) => {
      if (newName) {
        this.renameEntry(newName, file);
      }
    });
  }

  renameEntry(newName: string, file: OsfFile): void {
    if (newName.trim() && file.links.upload) {
      this.actions().setFilesIsLoading(true);
      this.actions()
        .renameEntry(this.projectId(), file.links.upload, newName)
        .pipe(take(1))
        .subscribe();
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

  downloadFolder(folderId: string, rootFolder: boolean): void {
    const projectId = this.projectId();
    if (projectId && folderId) {
      if (rootFolder) {
        const link = this.projectFilesService.getFolderDownloadLink(projectId, '', true);
        window.open(link, '_blank')?.focus();
      } else {
        const link = this.projectFilesService.getFolderDownloadLink(projectId, folderId, false);
        window.open(link, '_blank')?.focus();
      }
    }
  }

  moveFile(file: OsfFile, action: string): void {
    this.actions()
      .setMoveFileCurrentFolder(this.currentFolder())
      .pipe(take(1))
      .subscribe(() => {
        const header = action === 'move' ? this.translateService.instant('project.files.dialogs.moveFile.title') : this.translateService.instant('project.files.dialogs.copyFile.title');
        this.dialogRef = this.dialogService.open(MoveFileDialogComponent, {
          width: '552px',
          focusOnShow: false,
          header: header,
          closeOnEscape: true,
          modal: true,
          closable: true,
          data: {
            file: file,
            projectId: this.projectId(),
            action: action,
          },
        });
      });
  }

  updateFilesList(): void {
    const currentFolder = this.currentFolder();
    if (currentFolder?.relationships.filesLink) {
      this.actions()
        .getFiles(currentFolder?.relationships.filesLink)
        .pipe(take(1))
        .subscribe(() => {
          this.actions().setFilesIsLoading(false);
        });
    } else {
      this.actions().getRootFolderFiles(this.projectId());
    }
  }

  copyToClipboard(embedHtml: string): void {
    navigator.clipboard
      .writeText(embedHtml)
      .then(() => {
        this.toastService.showSuccess(this.translateService.instant('project.files.toast.copiedToClipboard'));
      })
      .catch((err) => {
        this.toastService.showError(err.message);
      });
  }

  async dropNode(event: TreeNodeDropEvent) {
    const dragNode = event.dragNode as OsfFile;
    const dropNode = event.dropNode as OsfFile;

    const message = this.translateService.instant('project.files.dialogs.moveFile.message', {
      dragNodeName: dragNode.name,
      dropNodeName: dropNode.previousFolder ? 'parent folder' : dropNode.name
    });

    this.confirmationService.confirm({
      ...defaultConfirmationConfig,
      message,
      header: this.translateService.instant('project.files.dialogs.moveFile.title'),
      acceptButtonProps: {
        ...defaultConfirmationConfig.acceptButtonProps,
        label: this.translateService.instant('common.buttons.move'),
      },
      accept: async () => {
        await this.dropFileToFolder(event);
      },
      reject: () => {
        const filesLink = this.currentFolder()?.relationships.filesLink;
        if (filesLink) {
          this.actions().getFiles(filesLink);
        } else {
          this.actions().getRootFolderFiles(this.projectId());
        }
      },
    });
  }

  async dropFileToFolder(event: TreeNodeDropEvent): Promise<void> {
    this.actions().setFilesIsLoading(true);

    const dropNode = event.dropNode as OsfFile;
    const dragNode = event.dragNode as OsfFile;
    let path = dropNode?.path;
    const moveLink = dragNode?.links?.move;
    let parentFolder: OsfFile | null = null;

    if (dropNode?.previousFolder) {
      parentFolder = await firstValueFrom(this.projectFilesService.getFolder(dropNode.relationships.parentFolderLink));
      if (!parentFolder.relationships.parentFolderLink) {
        path = '/';
      } else {
        path = parentFolder.path;
      }
    }

    if (!path) {
      throw new Error('Path is not specified!.');
    }

    this.projectFilesService
      .moveFile(moveLink, path, this.projectId(), 'move')
      .pipe(
        take(1),
        finalize(() => {
          this.actions().setCurrentFolder(dropNode?.previousFolder ? parentFolder : dropNode);
        })
      )
      .subscribe((file) => {
        if (file.id) {
          if (dropNode?.previousFolder) {
            const filesLink = parentFolder?.relationships.filesLink;

            if (filesLink) {
              this.actions().getFiles(filesLink);
            } else {
              this.actions().getRootFolderFiles(this.projectId());
            }
          } else {
            const filesLink = dropNode?.relationships.filesLink;
            this.actions().getFiles(filesLink);
          }
        }
      });
  }
}
