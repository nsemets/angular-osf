import { select, Store } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { TreeDragDropService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { debounceTime, finalize, Observable, skip, take } from 'rxjs';

import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CreateFolderDialogComponent } from '@osf/features/project/files/components';
import { FilesTreeActions } from '@osf/features/project/files/models';
import {
  CreateFolder,
  DeleteEntry,
  GetFiles,
  GetRootFolderFiles,
  ProjectFilesSelectors,
  RenameEntry,
  SetCurrentFolder,
  SetFilesIsLoading,
  SetMoveFileCurrentFolder,
  SetSearch,
  SetSort,
} from '@osf/features/project/files/store';
import { approveFile } from '@osf/features/project/files/utils';
import { ALL_SORT_OPTIONS } from '@osf/shared/constants';
import {
  FilesTreeComponent,
  FormSelectComponent,
  LoadingSpinnerComponent,
  SearchInputComponent,
  SubHeaderComponent,
} from '@shared/components';
import { FilesService, ToastService } from '@shared/services';

import { FILE_MENU_ITEMS } from '../../constants';

@Component({
  selector: 'osf-project-files',
  imports: [
    TableModule,
    Button,
    FloatLabel,
    SubHeaderComponent,
    SearchInputComponent,
    Select,
    LoadingSpinnerComponent,
    Dialog,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    FilesTreeComponent,
    FormSelectComponent,
  ],
  templateUrl: './project-files.component.html',
  styleUrl: './project-files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService, TreeDragDropService],
})
export class ProjectFilesComponent {
  @HostBinding('class') classes = 'flex flex-column flex-1 w-full h-full';

  readonly store = inject(Store);
  readonly filesService = inject(FilesService);
  readonly router = inject(Router);
  readonly activeRoute = inject(ActivatedRoute);
  readonly destroyRef = inject(DestroyRef);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly dialogService = inject(DialogService);
  readonly translateService = inject(TranslateService);

  protected readonly files = select(ProjectFilesSelectors.getFiles);
  protected readonly currentFolder = select(ProjectFilesSelectors.getCurrentFolder);
  protected readonly provider = select(ProjectFilesSelectors.getProvider);

  protected readonly projectId = signal<string>('');
  protected readonly progress = signal(0);
  protected readonly fileName = signal('');
  protected readonly searchControl = new FormControl<string>('');
  protected readonly sortControl = new FormControl(ALL_SORT_OPTIONS[0].value);

  fileIsUploading = signal(false);
  isFolderOpening = signal(false);

  items = FILE_MENU_ITEMS;
  sortOptions = ALL_SORT_OPTIONS;

  protected readonly filesTreeActions: FilesTreeActions = {
    setCurrentFolder: (folder) => this.store.dispatch(new SetCurrentFolder(folder)),
    setSearch: (search) => this.store.dispatch(new SetSearch(search)),
    setSort: (sort) => this.store.dispatch(new SetSort(sort)),
    setFilesIsLoading: (isLoading) => this.store.dispatch(new SetFilesIsLoading(isLoading)),
    getFiles: (filesLink) => this.store.dispatch(new GetFiles(filesLink)),
    getRootFolderFiles: (projectId) => this.store.dispatch(new GetRootFolderFiles(projectId)),
    deleteEntry: (projectId, link) => this.store.dispatch(new DeleteEntry(projectId, link)),
    renameEntry: (projectId, link, newName) => this.store.dispatch(new RenameEntry(projectId, link, newName)),
    setMoveFileCurrentFolder: (folder) => this.store.dispatch(new SetMoveFileCurrentFolder(folder)),
  };

  constructor() {
    this.activeRoute.parent?.parent?.parent?.params.subscribe((params) => {
      if (params['id']) {
        this.projectId.set(params['id']);
        this.store.dispatch(new GetRootFolderFiles(params['id']));
      }
    });

    this.searchControl.valueChanges
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef), debounceTime(500))
      .subscribe((searchText) => {
        this.store.dispatch(new SetSearch(searchText ?? ''));
        if (!this.isFolderOpening()) {
          this.updateFilesList();
        }
      });

    this.sortControl.valueChanges.pipe(skip(1), takeUntilDestroyed(this.destroyRef)).subscribe((sort) => {
      this.store.dispatch(new SetSort(sort ?? ''));
      if (!this.isFolderOpening()) {
        this.updateFilesList();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName.set(file.name);
    this.fileIsUploading.set(true);
    this.filesService
      .uploadFile(file, this.projectId(), this.provider(), this.currentFolder())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.fileName.set('');
          input.value = '';
          this.updateFilesList().subscribe(() => this.fileIsUploading.set(false));
        })
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((event.loaded / event.total) * 100));
        }

        if (event.type === HttpEventType.Response) {
          if (event.body) {
            const fileId = event?.body?.data.id;
            approveFile(fileId, this.projectId());
          }
        }
      });
  }

  createFolder(): void {
    this.dialogService
      .open(CreateFolderDialogComponent, {
        width: '448px',
        focusOnShow: false,
        header: this.translateService.instant('project.files.dialogs.createFolder.title'),
        closeOnEscape: true,
        modal: true,
        closable: true,
      })
      .onClose.subscribe((result) => {
        if (result && this.currentFolder()) {
          this.store.dispatch(new SetFilesIsLoading(true));
          this.store
            .dispatch(
              new CreateFolder(
                this.projectId(),
                result,
                this.currentFolder()?.relationships?.parentFolderId ? this.currentFolder()!.id : ''
              )
            )
            .pipe(
              take(1),
              finalize(() => {
                this.updateFilesList().subscribe(() => this.fileIsUploading.set(false));
              })
            )
            .subscribe();
        }
      });
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

  updateFilesList(): Observable<void> {
    const currentFolder = this.currentFolder();
    if (currentFolder?.relationships.filesLink) {
      return this.store
        .dispatch(new GetFiles(currentFolder?.relationships.filesLink))
        .pipe(takeUntilDestroyed(this.destroyRef));
    } else {
      return this.store.dispatch(new GetRootFolderFiles(this.projectId()));
    }
  }

  folderIsOpening(value: boolean): void {
    this.isFolderOpening.set(value);
    if (value) {
      this.searchControl.setValue('');
      this.sortControl.setValue(ALL_SORT_OPTIONS[0].value);
    }
  }
}
