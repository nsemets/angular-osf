import { catchError, filter, forkJoin, Observable, of, switchMap, take } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { CreateFolderDialogComponent } from '../components/create-folder-dialog/create-folder-dialog.component';
import { MoveFileDialogComponent } from '../components/move-file-dialog/move-file-dialog.component';
import { CreateFolderOptions, DeleteSelectedOptions, MoveFilesOptions } from '../models/files-actions-options.model';

@Injectable()
export class FilesActionsService {
  private readonly customConfirmationService = inject(CustomConfirmationService);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly toastService = inject(ToastService);

  deleteSelected(options: DeleteSelectedOptions): void {
    if (!options.files.length) return;

    const fileNames = options.files.map((f) => f.name).join(', ');

    this.customConfirmationService.confirmDelete({
      headerKey: 'files.dialogs.deleteMultipleItems.title',
      messageKey: 'files.dialogs.deleteMultipleItems.message',
      messageParams: { name: fileNames },
      acceptLabelKey: 'common.buttons.delete',
      onConfirm: () => {
        const deleteRequests$ = options.files.map((file) =>
          options.deleteEntry(file.links.delete).pipe(catchError(() => of(null)))
        );

        forkJoin(deleteRequests$).subscribe({
          next: () => {
            this.toastService.showSuccess('files.dialogs.deleteFile.success');
            options.onSuccess();
          },
        });
      },
    });
  }

  openMoveDialog(options: MoveFilesOptions): Observable<unknown> {
    return this.customDialogService
      .open(MoveFileDialogComponent, {
        header: 'files.dialogs.moveFile.title',
        width: '552px',
        data: {
          files: options.files,
          resourceId: options.resourceId,
          action: options.action,
          storageProvider: options.storageProvider,
          foldersStack: options.foldersStack,
          initialFolder: structuredClone(options.initialFolder),
        },
      })
      .onClose.pipe(take(1));
  }

  openCreateFolderDialog(options: CreateFolderOptions): Observable<unknown> {
    return this.customDialogService
      .open(CreateFolderDialogComponent, {
        header: 'files.dialogs.createFolder.title',
        width: '448px',
      })
      .onClose.pipe(
        filter((folderName: string) => !!folderName),
        switchMap((folderName) => options.createFolder(options.newFolderLink, folderName)),
        take(1)
      );
  }
}
