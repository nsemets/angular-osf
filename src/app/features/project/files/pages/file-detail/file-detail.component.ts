import { select, Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tab, TabList, Tabs } from 'primeng/tabs';

import { EMPTY, switchMap } from 'rxjs';

import { ChangeDetectionStrategy, Component, DestroyRef, HostBinding, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  FileKeywordsComponent,
  FileMetadataComponent,
  FileProjectMetadataComponent,
  FileRevisionsComponent,
} from '@osf/features/project/files/components';
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
import { OsfFile } from '@shared/models';
import { CustomConfirmationService, ToastService } from '@shared/services';

@Component({
  selector: 'osf-file-detail',
  imports: [
    SubHeaderComponent,
    RouterLink,
    LoadingSpinnerComponent,
    TranslatePipe,
    FileMetadataComponent,
    Button,
    Popover,
    FileKeywordsComponent,
    FileRevisionsComponent,
    Tab,
    TabList,
    Tabs,
    FileProjectMetadataComponent,
  ],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDetailComponent {
  @HostBinding('class') classes = 'flex flex-column flex-1 w-full h-full';

  readonly store = inject(Store);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly destroyRef = inject(DestroyRef);
  readonly sanitizer = inject(DomSanitizer);
  readonly toastService = inject(ToastService);
  readonly customConfirmationService = inject(CustomConfirmationService);

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
    this.route.parent?.parent?.parent?.parent?.params.subscribe((params) => {
      if (params['id']) {
        this.projectId = params['id'];
      }
    });

    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.fileGuid = params['fileGuid'];
          return this.store
            .dispatch(new GetFile(this.fileGuid))
            .pipe(switchMap(() => this.route.parent?.parent?.parent?.params || EMPTY));
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
        this.toastService.showSuccess('project.files.detail.toast.copiedToClipboard');
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

  confirmDelete(file: OsfFile): void {
    this.customConfirmationService.confirmDelete({
      headerKey: 'project.files.dialogs.deleteFile.title',
      messageParams: { name: file.name },
      messageKey: 'project.files.dialogs.deleteFile.message',
      onConfirm: () => this.deleteEntry(file.links.delete),
    });
  }

  onTabChange(index: FileDetailTab): void {
    this.selectedTab = index;
  }

  protected getEmailLink(): string {
    return `mailto:?subject=${this.file().data?.name ?? ''}&body=${this.file().data?.links?.html ?? ''}`;
  }

  protected getTwitterLink(): string {
    return `https://twitter.com/intent/tweet?url=${this.file().data?.links?.html ?? ''}&text=${this.file().data?.name ?? ''}&via=OSFramework`;
  }

  protected getFacebookLink(): string {
    return `https://www.facebook.com/dialog/share?app_id=1022273774556662&display=popup&href=${this.file().data?.links?.html ?? ''}&redirect_uri=${this.file().data?.links?.html ?? ''}`;
  }

  protected handleEmailShare(share: Popover): void {
    this.openLink(this.getEmailLink());
    share.hide();
  }

  protected handleTwitterShare(share: Popover): void {
    this.openLinkNewTab(this.getTwitterLink());
    share.hide();
  }

  protected handleFacebookShare(share: Popover): void {
    this.openLinkNewTab(this.getFacebookLink());
    share.hide();
  }

  protected getEmbedDynamicHtml(): string {
    return this.dynamicHtml.replace('ENCODED_URL', this.file().data?.links?.render ?? '');
  }

  protected getEmbedStaticHtml(): string {
    return this.staticHtml.replace('ENCODED_URL', this.file().data?.links?.render ?? '');
  }

  protected handleCopyDynamicEmbed(embed: Popover): void {
    this.copyToClipboard(this.getEmbedDynamicHtml());
    embed.hide();
  }

  protected handleCopyStaticEmbed(embed: Popover): void {
    this.copyToClipboard(this.getEmbedStaticHtml());
    embed.hide();
  }
}
