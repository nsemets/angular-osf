import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { TreeDragDropService } from 'primeng/api';
import { Button } from 'primeng/button';

import { EMPTY, filter, finalize, Observable, shareReplay, take } from 'rxjs';

import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HelpScoutService } from '@core/services/help-scout.service';
import { CreateFolderDialogComponent } from '@osf/features/files/components';
import { FileUploadDialogComponent } from '@osf/shared/components/file-upload-dialog/file-upload-dialog.component';
import { FilesTreeComponent } from '@osf/shared/components/files-tree/files-tree.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { FILE_SIZE_LIMIT } from '@osf/shared/constants';
import { ClearFileDirective } from '@osf/shared/directives';
import { FileFolderModel, FileModel } from '@osf/shared/models';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';

import {
  CreateFolder,
  GetFiles,
  GetRootFolders,
  RegistriesSelectors,
  SetCurrentFolder,
  SetFilesIsLoading,
} from '../../store';

@Component({
  selector: 'osf-files-control',
  imports: [
    FilesTreeComponent,
    Button,
    LoadingSpinnerComponent,
    FileUploadDialogComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    ClearFileDirective,
  ],
  templateUrl: './files-control.component.html',
  styleUrl: './files-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TreeDragDropService],
})
export class FilesControlComponent implements OnDestroy {
  attachedFiles = input.required<Partial<FileModel>[]>();
  attachFile = output<FileModel>();
  filesLink = input.required<string>();
  projectId = input.required<string>();
  provider = input.required<string>();
  filesViewOnly = input<boolean>(false);

  private readonly filesService = inject(FilesService);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly helpScoutService = inject(HelpScoutService);

  readonly files = select(RegistriesSelectors.getFiles);
  readonly filesTotalCount = select(RegistriesSelectors.getFilesTotalCount);
  readonly isFilesLoading = select(RegistriesSelectors.isFilesLoading);
  readonly currentFolder = select(RegistriesSelectors.getCurrentFolder);

  readonly progress = signal(0);
  readonly fileName = signal('');
  readonly dataLoaded = signal(false);

  fileIsUploading = signal(false);

  private readonly actions = createDispatchMap({
    createFolder: CreateFolder,
    getFiles: GetFiles,
    setFilesIsLoading: SetFilesIsLoading,
    setCurrentFolder: SetCurrentFolder,
    getRootFolders: GetRootFolders,
  });

  constructor() {
    this.helpScoutService.setResourceType('files');
    effect(() => {
      const filesLink = this.filesLink();
      if (filesLink) {
        this.actions
          .getRootFolders(filesLink)
          .pipe(shareReplay(), takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.dataLoaded.set(true);
          });
      }
    });

    effect(() => {
      const currentFolder = this.currentFolder();
      if (currentFolder) {
        this.updateFilesList().subscribe();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.size >= FILE_SIZE_LIMIT) {
      this.toastService.showWarn('shared.files.limitText');
      return;
    }
    if (!file) return;

    this.uploadFiles(file);
  }

  createFolder(): void {
    const currentFolder = this.currentFolder();
    const newFolderLink = currentFolder?.links.newFolder;

    if (!newFolderLink) return;

    this.customDialogService
      .open(CreateFolderDialogComponent, {
        header: 'files.dialogs.createFolder.title',
        width: '448px',
      })
      .onClose.pipe(filter((folderName: string) => !!folderName))
      .subscribe((folderName) => {
        this.actions
          .createFolder(newFolderLink, folderName)
          .pipe(
            take(1),
            finalize(() => {
              this.updateFilesList().subscribe(() => this.fileIsUploading.set(false));
            })
          )
          .subscribe();
      });
  }

  updateFilesList(): Observable<void> {
    const currentFolder = this.currentFolder();
    if (currentFolder?.links.filesLink) {
      this.actions.setFilesIsLoading(true);
      return this.actions.getFiles(currentFolder?.links.filesLink, 1).pipe(take(1));
    }

    return EMPTY;
  }

  uploadFiles(files: File | File[]): void {
    const fileArray = Array.isArray(files) ? files : [files];
    const file = fileArray[0];
    const currentFolder = this.currentFolder();
    const uploadLink = currentFolder?.links.upload;
    if (!uploadLink) return;

    this.fileName.set(file.name);
    this.fileIsUploading.set(true);

    this.filesService
      .uploadFile(file, uploadLink)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.fileIsUploading.set(false);
          this.fileName.set('');
          this.updateFilesList();
        })
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((event.loaded / event.total) * 100));
        }

        if (event.type === HttpEventType.Response) {
          if (event.body) {
            const fileId = event?.body?.data?.id?.split('/').pop();
            if (fileId) {
              this.filesService
                .getFileGuid(fileId)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((file) => {
                  this.selectFile(file);
                });
            }
          }
        }
      });
  }

  selectFile(file: FileModel): void {
    if (this.filesViewOnly()) return;
    this.attachFile.emit(file);
  }

  onLoadFiles(event: { link: string; page: number }) {
    this.actions.getFiles(event.link, event.page);
  }

  setCurrentFolder(folder: FileFolderModel) {
    this.actions.setCurrentFolder(folder);
  }

  ngOnDestroy(): void {
    this.helpScoutService.unsetResourceType();
  }
}
