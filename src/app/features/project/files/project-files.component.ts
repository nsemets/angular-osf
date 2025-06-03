import { select, Store } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { TreeDragDropService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { debounceTime, filter, finalize, skip } from 'rxjs';

import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FilesTreeComponent, CreateFolderDialogComponent } from '@osf/features/project/files/components';
import { ProjectFilesService } from '@osf/features/project/files/services';
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
import { FilesTreeActions } from '@osf/features/project/files/models';
import { LoadingSpinnerComponent, SearchInputComponent, SubHeaderComponent } from '@shared/components';
import { ToastService } from '@shared/services';

import { FILE_MENU_ITEMS, FILE_SORT_OPTIONS } from './constants';

import { environment } from 'src/environments/environment';

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
  ],
  templateUrl: './project-files.component.html',
  styleUrl: './project-files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService, TreeDragDropService],
})
export class ProjectFilesComponent {
  @HostBinding('class') classes = 'flex flex-column flex-1 w-full h-full';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly store = inject(Store);
  readonly projectFilesService = inject(ProjectFilesService);
  readonly router = inject(Router);
  readonly activeRoute = inject(ActivatedRoute);
  readonly destroyRef = inject(DestroyRef);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);

  protected readonly files = select(ProjectFilesSelectors.getFiles);
  protected readonly currentFolder = select(ProjectFilesSelectors.getCurrentFolder);

  protected readonly projectId = signal<string>('');
  protected readonly progress = signal(0);
  protected readonly fileName = signal('');
  protected readonly isFilesUpdating = signal<boolean>(false);
  protected readonly searchControl = new FormControl<string>('');
  protected readonly sortControl = new FormControl(FILE_SORT_OPTIONS[0].value);

  dialogRef: DynamicDialogRef | null = null;

  fileIsUploading = signal(false);

  items = FILE_MENU_ITEMS;
  sortOptions = FILE_SORT_OPTIONS;

  readonly isBatching = signal(false);

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
    this.activeRoute.parent?.params.subscribe((params) => {
      if (params['id']) {
        this.projectId.set(params['id']);
        this.store.dispatch(new GetRootFolderFiles(params['id']));
      }
    });

    this.searchControl.valueChanges
      .pipe(
        skip(1),
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500),
        filter(() => !this.isBatching())
      )
      .subscribe((searchText) => {
        this.store.dispatch(new SetSearch(searchText ?? ''));
        this.updateFilesList();
      });

    this.sortControl.valueChanges
      .pipe(
        skip(1),
        takeUntilDestroyed(this.destroyRef),
        filter(() => !this.isBatching())
      )
      .subscribe((sort) => {
        this.store.dispatch(new SetSort(sort ?? ''));
        this.updateFilesList();
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName.set(file.name);
    this.fileIsUploading.set(true);
    this.projectFilesService
      .uploadFile(file, this.projectId(), this.currentFolder())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.fileIsUploading.set(false);
          this.fileName.set('');
          input.value = '';
          this.updateFilesList();
        })
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((event.loaded / event.total) * 100));
        }

        if (event.type === HttpEventType.Response) {
          if (event.body) {
            const fileId = event?.body?.data.id;
            this.approveFile(fileId);
          }
        }
      });
  }

  createFolder(): void {
    const ref = this.#dialogService.open(CreateFolderDialogComponent, {
      width: '448px',
      focusOnShow: false,
      header: this.#translateService.instant('project.files.dialogs.createFolder.title'),
      closeOnEscape: true,
      modal: true,
      closable: true,
    });

    ref.onClose.subscribe((result) => {
      if (result) {
        this.store.dispatch(new SetFilesIsLoading(true));
        this.store
          .dispatch(new CreateFolder(this.projectId(), result, this.currentFolder()?.relationships?.parentFolderId))
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
              this.store.dispatch(new SetFilesIsLoading(false));
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
        const link = this.projectFilesService.getFolderDownloadLink(projectId, '', true);
        window.open(link, '_blank')?.focus();
      } else {
        const link = this.projectFilesService.getFolderDownloadLink(projectId, folderId, false);
        window.open(link, '_blank')?.focus();
      }
    }
  }

  approveFile(fileId: string): void {
    const projectId = this.projectId();
    const link = `${environment.apiUrlV1}/${projectId}/files/${fileId}/`;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = link;

    // Optionally clean up the iframe after it's done
    iframe.onload = () => {
      setTimeout(() => iframe.remove(), 3000); // wait just in case redirects
    };

    document.body.appendChild(iframe);
  }

  updateFilesList(): void {
    const currentFolder = this.currentFolder();
    if (currentFolder?.relationships.filesLink) {
      this.store
        .dispatch(new GetFiles(currentFolder?.relationships.filesLink))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.store.dispatch(new SetFilesIsLoading(false));
        });
    } else {
      this.store.dispatch(new GetRootFolderFiles(this.projectId()));
    }
  }
}
