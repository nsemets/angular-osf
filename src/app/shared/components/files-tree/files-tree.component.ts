import { select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';
import { Popover } from 'primeng/popover';
import { Tree, TreeNodeDropEvent } from 'primeng/tree';

import { finalize, firstValueFrom, Observable, switchMap, take, tap } from 'rxjs';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MoveFileDialogComponent, RenameFileDialogComponent } from '@osf/features/project/files/components';
import { FILE_MENU_ITEMS } from '@osf/features/project/files/constants';
import { embedDynamicJs, embedStaticHtml, FileMenuItems, FilesTreeActions } from '@osf/features/project/files/models';
import { ProjectFilesSelectors } from '@osf/features/project/files/store';
import { LoadingSpinnerComponent } from '@shared/components';
import { AsyncStateModel, OsfFile } from '@shared/models';
import { FileSizePipe } from '@shared/pipes';
import { CustomConfirmationService, FilesService, ToastService } from '@shared/services';

@Component({
  selector: 'osf-files-tree',
  imports: [Button, DatePipe, FileSizePipe, Menu, Popover, PrimeTemplate, TranslatePipe, Tree, LoadingSpinnerComponent],
  templateUrl: './files-tree.component.html',
  styleUrl: './files-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeComponent {
  readonly filesService = inject(FilesService);
  readonly router = inject(Router);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly customConfirmationService = inject(CustomConfirmationService);
  readonly dialogService = inject(DialogService);
  readonly translateService = inject(TranslateService);

  searchControl = input.required<FormControl>();
  sortControl = input.required<FormControl>();
  projectId = input.required<string>();
  actions = input.required<FilesTreeActions>();
  readonly = input.required<boolean>();
  files = input.required<AsyncStateModel<OsfFile[]>>();
  provider = input.required<string>();

  folderIsOpening = output<boolean>();

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

  items = FILE_MENU_ITEMS;
  dynamicHtml = embedDynamicJs;
  staticHtml = embedStaticHtml;

  protected readonly FileMenuItems = FileMenuItems;

  openEntry(file: OsfFile) {
    if (file.kind === 'file') {
      this.router.navigate([file.guid], { relativeTo: this.route });
    } else {
      this.actions().setFilesIsLoading(true);
      this.folderIsOpening.emit(true);

      this.actions()
        .setCurrentFolder(file)
        .pipe(take(1))
        .subscribe(() => {
          this.updateFilesList().subscribe(() => this.folderIsOpening.emit(false));
        });
    }
  }

  openParentFolder() {
    const currentFolder = this.currentFolder();

    if (!currentFolder) return;

    this.actions().setFilesIsLoading(true);
    this.folderIsOpening.emit(true);

    this.filesService
      .getFolder(currentFolder.relationships.parentFolderLink)
      .pipe(
        take(1),
        switchMap((folder) =>
          this.actions()
            .setCurrentFolder(folder)
            .pipe(
              take(1),
              tap(() => this.updateFilesList().subscribe(() => this.folderIsOpening.emit(false)))
            )
        )
      )
      .subscribe();
  }

  confirmDelete(file: OsfFile): void {
    this.customConfirmationService.confirmDelete({
      headerKey: 'project.files.dialogs.deleteFile.title',
      messageParams: { name: file.name },
      messageKey: 'project.files.dialogs.deleteFile.message',
      acceptLabelKey: 'common.buttons.remove',
      onConfirm: () => this.deleteEntry(file.links.delete),
    });
  }

  deleteEntry(link: string): void {
    this.actions().setFilesIsLoading(true);
    this.actions().deleteEntry(this.projectId(), link).pipe(take(1)).subscribe();
  }

  confirmRename(file: OsfFile): void {
    this.dialogService
      .open(RenameFileDialogComponent, {
        width: '448px',
        focusOnShow: false,
        header: this.translateService.instant('project.files.dialogs.renameFile.title'),
        closeOnEscape: true,
        modal: true,
        closable: true,
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

  renameEntry(newName: string, file: OsfFile): void {
    if (newName.trim() && file.links.upload) {
      this.actions().setFilesIsLoading(true);
      this.actions().renameEntry(this.projectId(), file.links.upload, newName).pipe(take(1)).subscribe();
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
        const link = this.filesService.getFolderDownloadLink(projectId, this.provider(), '', true);
        window.open(link, '_blank')?.focus();
      } else {
        const link = this.filesService.getFolderDownloadLink(projectId, this.provider(), folderId, false);
        window.open(link, '_blank')?.focus();
      }
    }
  }

  moveFile(file: OsfFile, action: string): void {
    this.actions()
      .setMoveFileCurrentFolder(this.currentFolder())
      .pipe(take(1))
      .subscribe(() => {
        const header =
          action === 'move'
            ? this.translateService.instant('project.files.dialogs.moveFile.title')
            : this.translateService.instant('project.files.dialogs.copyFile.title');

        this.dialogService.open(MoveFileDialogComponent, {
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

  updateFilesList(): Observable<void> {
    const currentFolder = this.currentFolder();
    if (currentFolder?.relationships.filesLink) {
      return this.actions().getFiles(currentFolder?.relationships.filesLink).pipe(take(1));
    } else {
      return this.actions().getRootFolderFiles(this.projectId());
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

    this.customConfirmationService.confirmAccept({
      headerKey: 'project.files.dialogs.moveFile.title',
      messageParams: {
        dragNodeName: dragNode.name,
        dropNodeName: dropNode.previousFolder ? 'parent folder' : dropNode.name,
      },
      messageKey: 'project.files.dialogs.moveFile.message',
      onConfirm: async () => {
        await this.dropFileToFolder(event);
      },
      onReject: () => {
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
      parentFolder = await firstValueFrom(this.filesService.getFolder(dropNode.relationships.parentFolderLink));
      if (!parentFolder.relationships.parentFolderLink) {
        path = '/';
      } else {
        path = parentFolder.path;
      }
    }

    if (!path) {
      throw new Error('Path is not specified!.');
    }

    this.filesService
      .moveFile(moveLink, path, this.projectId(), this.provider(), 'move')
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
