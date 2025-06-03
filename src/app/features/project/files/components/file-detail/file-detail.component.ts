import { select, Store } from '@ngxs/store';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { EMPTY, switchMap } from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  inject,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  FileKeywordsComponent,
  FileMetadataComponent,
  FileProjectMetadataComponent,
  FileRevisionsComponent,
} from '@osf/features/project/files/components/file-detail/components';
import { FileDetailTab } from '@osf/features/project/files/enums/file-detail-tab.enum';
import { embedDynamicJs, embedStaticHtml } from '@osf/features/project/files/models';
import {
  DeleteEntry,
  GetFile,
  GetFileMetadata,
  GetFileProjectContributors,
  GetFileProjectMetadata,
  GetFileRevisions,
  ProjectFilesSelectors,
} from '@osf/features/project/files/store';
import { LoadingSpinnerComponent, SubHeaderComponent } from '@shared/components';
import { ResourceTab } from '@shared/enums';
import { ToastService } from '@shared/services';
import { defaultConfirmationConfig } from '@shared/utils';


@Component({
  selector: 'osf-file-detail',
  imports: [
    SubHeaderComponent,
    RouterLink,
    LoadingSpinnerComponent,
    TranslateModule,
    FileMetadataComponent,
    Button,
    FormsModule,
    ReactiveFormsModule,
    Popover,
    FileProjectMetadataComponent,
    FileKeywordsComponent,
    FileRevisionsComponent,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
  ],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDetailComponent {
  @HostBinding('class') classes = 'flex flex-column flex-1 w-full h-full';
  @ViewChild('fileDetailContainer') fileDetailContainer!: ElementRef;
  readonly store = inject(Store);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly destroyRef = inject(DestroyRef);
  readonly sanitizer = inject(DomSanitizer);
  readonly toastService = inject(ToastService);
  readonly confirmationService = inject(ConfirmationService);
  readonly translateService = inject(TranslateService);

  file = select(ProjectFilesSelectors.getOpenedFile);
  safeLink: SafeResourceUrl | null = null;
  projectId: string | null = null;

  isIframeLoading = true;

  protected readonly staticHtml = embedStaticHtml;
  protected readonly dynamicHtml = embedDynamicJs;
  protected readonly ResourceTab = ResourceTab;
  protected readonly FileDetailTab = FileDetailTab;

  protected selectedTab: FileDetailTab = FileDetailTab.Details;

  fileGuid = '';

  constructor() {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.fileGuid = params['fileGuid'];
          return this.store
            .dispatch(new GetFile(this.fileGuid))
            .pipe(switchMap(() => this.route.parent?.params || EMPTY));
        })
      )
      .subscribe((parentParams) => {
        const link = this.file().data?.links.render;
        if (link) {
          this.safeLink = this.sanitizer.bypassSecurityTrustResourceUrl(link);
        }

        this.projectId = parentParams['id'];
        if (this.projectId) {
          this.store.dispatch(new GetFileProjectMetadata(this.projectId));
          this.store.dispatch(new GetFileProjectContributors(this.projectId));
          const fileId = this.file().data?.path.replaceAll('/', '');
          if (fileId) {
            this.store.dispatch(new GetFileRevisions(this.projectId, fileId));
          }
        }
      });

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.store.dispatch(new GetFileMetadata(params['fileGuid']));
    });
  }

  downloadFile(link: string): void {
    window.open(link)?.focus();
  }

  openLinkNewTab(link: string): void {
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  openLink(link: string): void {
    window.location.href = link;
  }

  copyToClipboard(embedHtml: string): void {
    navigator.clipboard
      .writeText(embedHtml)
      .then(() => {
        this.toastService.showSuccess(this.translateService.instant('project.files.detail.toast.copiedToClipboard'));
      })
      .catch((err) => {
        this.toastService.showError(err.message);
      });
  }

  deleteEntry(link: string): void {
    if (this.projectId) {
      this.store
        .dispatch(new DeleteEntry(this.projectId, link))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.router.navigate(['/my-projects', this.projectId, 'files']);
        });
    }
  }

  confirmDelete(link: string): void {
    this.confirmationService.confirm({
      ...defaultConfirmationConfig,
      header: this.translateService.instant('project.files.dialogs.deleteFile.title'),
      message: this.translateService.instant('project.files.dialogs.deleteFile.message'),
      acceptButtonProps: {
        severity: 'danger',
        label: this.translateService.instant('common.buttons.delete'),
      },
      accept: () => {
        this.deleteEntry(link);
      },
    });
  }

  onTabChange(index: FileDetailTab): void {
    this.selectedTab = index;
  }
}
