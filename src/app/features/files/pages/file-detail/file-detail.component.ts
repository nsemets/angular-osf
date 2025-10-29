import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { Tab, TabList, Tabs } from 'primeng/tabs';

import { switchMap } from 'rxjs';

import { Clipboard } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import {
  CedarMetadataDataTemplateJsonApi,
  CedarMetadataRecordData,
  CedarRecordDataBinding,
} from '@osf/features/metadata/models';
import {
  CreateCedarMetadataRecord,
  GetCedarMetadataRecords,
  GetCedarMetadataTemplates,
  MetadataSelectors,
  UpdateCedarMetadataRecord,
} from '@osf/features/metadata/store';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { MetadataTabsComponent } from '@osf/shared/components/metadata-tabs/metadata-tabs.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { MetadataResourceEnum } from '@osf/shared/enums/metadata-resource.enum';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { pathJoin } from '@osf/shared/helpers/path-join.helper';
import { getViewOnlyParam, hasViewOnlyParam } from '@osf/shared/helpers/view-only.helper';
import { FileDetailsModel, MetadataTabsModel } from '@osf/shared/models';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { DataciteService } from '@osf/shared/services/datacite/datacite.service';
import { MetaTagsService } from '@osf/shared/services/meta-tags.service';
import { ToastService } from '@osf/shared/services/toast.service';

import {
  FileKeywordsComponent,
  FileMetadataComponent,
  FileResourceMetadataComponent,
  FileRevisionsComponent,
} from '../../components';
import { embedDynamicJs, embedStaticHtml } from '../../constants';
import { FileDetailTab } from '../../enums';
import {
  DeleteEntry,
  FilesSelectors,
  GetFile,
  GetFileMetadata,
  GetFileResourceContributors,
  GetFileResourceMetadata,
  GetFileRevisions,
} from '../../store';

@Component({
  selector: 'osf-file-detail',
  imports: [
    RouterLink,
    Button,
    Tab,
    TabList,
    Tabs,
    Menu,
    TranslatePipe,
    SubHeaderComponent,
    LoadingSpinnerComponent,
    FileKeywordsComponent,
    FileRevisionsComponent,
    FileMetadataComponent,
    FileResourceMetadataComponent,
    MetadataTabsComponent,
    TableModule,
  ],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
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

  private readonly metaTags = inject(MetaTagsService);
  private readonly datePipe = inject(DatePipe);
  private readonly translateService = inject(TranslateService);
  private readonly environment = inject(ENVIRONMENT);
  private readonly clipboard = inject(Clipboard);

  readonly dataciteService = inject(DataciteService);

  private readonly webUrl = this.environment.webUrl;

  private readonly actions = createDispatchMap({
    getFile: GetFile,
    getFileRevisions: GetFileRevisions,
    getFileMetadata: GetFileMetadata,
    getFileResourceMetadata: GetFileResourceMetadata,
    getFileResourceContributors: GetFileResourceContributors,
    deleteEntry: DeleteEntry,

    getCedarRecords: GetCedarMetadataRecords,
    getCedarTemplates: GetCedarMetadataTemplates,
    createCedarRecord: CreateCedarMetadataRecord,
    updateCedarRecord: UpdateCedarMetadataRecord,
  });

  file = select(FilesSelectors.getOpenedFile);
  fileMetadata$ = toObservable(select(FilesSelectors.getResourceMetadata));
  isFileLoading = select(FilesSelectors.isOpenedFileLoading);
  cedarRecords = select(MetadataSelectors.getCedarRecords);
  cedarTemplates = select(MetadataSelectors.getCedarTemplates);
  isAnonymous = select(FilesSelectors.isFilesAnonymous);
  fileCustomMetadata = select(FilesSelectors.getFileCustomMetadata);
  isFileCustomMetadataLoading = select(FilesSelectors.isFileMetadataLoading);
  resourceMetadata = select(FilesSelectors.getResourceMetadata);
  resourceContributors = select(FilesSelectors.getContributors);
  isResourceContributorsLoading = select(FilesSelectors.isResourceContributorsLoading);
  fileRevisions = select(FilesSelectors.getFileRevisions);
  isFileRevisionLoading = select(FilesSelectors.isFileRevisionsLoading);
  hasWriteAccess = select(FilesSelectors.hasWriteAccess);

  hasViewOnly = computed(() => hasViewOnlyParam(this.router));

  safeLink: SafeResourceUrl | null = null;
  resourceId = '';
  resourceType = '';

  isIframeLoading = true;

  readonly FileDetailTab = FileDetailTab;

  selectedTab: FileDetailTab = FileDetailTab.Details;

  fileGuid = '';
  fileVersion = '';

  embedItems = [
    {
      label: 'files.detail.actions.copyDynamicIframe',
      command: () => this.handleCopyDynamicEmbed(),
    },
    {
      label: 'files.detail.actions.copyStaticIframe',
      command: () => this.handleCopyStaticEmbed(),
    },
  ];

  shareItems = [
    {
      label: 'files.detail.actions.share.email',
      command: () => this.handleEmailShare(),
    },
    {
      label: 'files.detail.actions.share.x',
      command: () => this.handleXShare(),
    },
    {
      label: 'files.detail.actions.share.facebook',
      command: () => this.handleFacebookShare(),
    },
  ];

  tabs = signal<MetadataTabsModel[]>([]);

  isLoading = computed(() => this.isFileLoading());

  selectedMetadataTab = signal('osf');

  selectedCedarRecord = signal<CedarMetadataRecordData | null>(null);
  selectedCedarTemplate = signal<CedarMetadataDataTemplateJsonApi | null>(null);
  cedarFormReadonly = signal<boolean>(true);

  showDeleteButton = computed(() => this.hasWriteAccess() && this.file() && !this.isAnonymous() && !this.hasViewOnly());

  private readonly metaTagsData = computed(() => {
    if (this.isFileLoading() || this.isFileCustomMetadataLoading() || this.isResourceContributorsLoading()) {
      return null;
    }

    const file = this.file();
    if (!file) return null;

    return {
      osfGuid: file.guid,
      title: this.fileCustomMetadata()?.title || file.name,
      type: this.fileCustomMetadata()?.resourceTypeGeneral,
      description:
        this.fileCustomMetadata()?.description ?? this.translateService.instant('files.metaTagDescriptionPlaceholder'),
      url: pathJoin(this.webUrl, this.fileGuid),
      publishedDate: this.datePipe.transform(file.dateCreated, 'yyyy-MM-dd'),
      modifiedDate: this.datePipe.transform(file.dateModified, 'yyyy-MM-dd'),
      language: this.fileCustomMetadata()?.language,
      contributors: this.resourceContributors()?.map((contributor) => ({
        fullName: contributor.fullName,
        givenName: contributor.givenName,
        familyName: contributor.familyName,
      })),
    };
  });

  constructor() {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.fileGuid = params['fileGuid'];
          return this.actions.getFile(this.fileGuid);
        })
      )
      .subscribe(() => {
        this.getIframeLink('');
        const file = this.file();
        if (file) {
          this.resourceId = file.target.id || '';
          this.resourceType = file.target.type || '';
          const cedarUrl = file.links.info;
          if (this.resourceId && this.resourceType) {
            this.actions.getFileResourceMetadata(this.resourceId, this.resourceType);
            this.actions.getFileResourceContributors(this.resourceId, this.resourceType);

            const storageLink = file.links.upload || '';
            this.actions.getFileRevisions(storageLink);
            this.actions.getCedarTemplates();
            if (cedarUrl) {
              this.actions.getCedarRecords(this.resourceId, ResourceType.File, cedarUrl);
            }
          }
        }
      });

    effect(() => {
      const records = this.cedarRecords();

      const baseTabs = [{ id: 'osf', label: 'OSF', type: MetadataResourceEnum.PROJECT }];

      const cedarTabs =
        records?.map((record) => ({
          id: record.id || '',
          label: record.embeds?.template?.data?.attributes?.schema_name || `Record ${record.id}`,
          type: MetadataResourceEnum.CEDAR,
        })) || [];

      this.tabs.set([...baseTabs, ...cedarTabs]);
    });

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.actions.getFileMetadata(params['fileGuid']);
    });

    effect(() => {
      const metaTagsData = this.metaTagsData();

      if (metaTagsData) {
        this.metaTags.updateMetaTags(metaTagsData, this.destroyRef);
      }
    });

    this.dataciteService.logIdentifiableView(this.fileMetadata$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  getIframeLink(version: string) {
    const url = this.getMfrUrlWithVersion(version);
    if (url) {
      this.safeLink = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  onOpenRevision(version: string): void {
    if (this.fileVersion !== version) {
      this.fileVersion = version;
      this.getIframeLink(version);
      this.isIframeLoading = true;
    }
  }

  downloadRevision(version: string) {
    this.dataciteService
      .logIdentifiableDownload(this.fileMetadata$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    const downloadUrl = this.file()?.links.download;
    const storageLink = this.file()?.links.upload || '';

    if (downloadUrl) {
      window.open(`${downloadUrl}/?revision=${version}`)?.focus();
      this.actions.getFileRevisions(storageLink);
    }
  }

  downloadFile(link: string): void {
    this.dataciteService
      .logIdentifiableDownload(this.fileMetadata$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    window.open(link)?.focus();
  }

  copyToClipboard(embedHtml: string): void {
    this.clipboard.copy(embedHtml);
    this.toastService.showSuccess('files.detail.toast.copiedToClipboard');
  }

  deleteEntry(link: string): void {
    if (this.resourceId) {
      const redirectUrl = `/${this.resourceId}/files`;
      this.actions
        .deleteEntry(link)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.router.navigate([redirectUrl]));
    }
  }

  confirmDelete(file: FileDetailsModel): void {
    this.customConfirmationService.confirmDelete({
      headerKey: 'files.dialogs.deleteFile.title',
      messageParams: { name: file.name },
      messageKey: 'files.dialogs.deleteFile.message',
      onConfirm: () => this.deleteEntry(file.links.delete),
    });
  }

  onTabChange(index: FileDetailTab): void {
    this.selectedTab = index;
  }

  handleEmailShare(): void {
    const link = `mailto:?subject=${this.file()?.name ?? ''}&body=${this.file()?.links?.html ?? ''}`;
    window.location.href = link;
  }

  handleXShare(): void {
    const link = `https://x.com/intent/tweet?url=${this.file()?.links?.html ?? ''}&text=${this.file()?.name ?? ''}&via=OSFramework`;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  handleFacebookShare(): void {
    const link = `https://www.facebook.com/dialog/share?app_id=${this.environment.facebookAppId}&display=popup&href=${this.file()?.links?.html ?? ''}&redirect_uri=${this.file()?.links?.html ?? ''}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  handleCopyDynamicEmbed(): void {
    const data = embedDynamicJs.replace('ENCODED_URL', this.file()?.links?.render ?? '');
    this.copyToClipboard(data);
  }

  handleCopyStaticEmbed(): void {
    const data = embedStaticHtml.replace('ENCODED_URL', this.file()?.links?.render ?? '');
    this.copyToClipboard(data);
  }

  onMetadataTabChange(tabId: string | number): void {
    const tab = this.tabs().find((x) => x.id === tabId.toString());

    if (!tab) {
      return;
    }

    this.selectedMetadataTab.set(tab.id as MetadataResourceEnum);
    if (tab.type === 'cedar') {
      this.selectedCedarRecord.set(null);
      this.selectedCedarTemplate.set(null);
      if (tab.id) {
        this.loadCedarRecord(tab.id);
      }
    } else {
      this.selectedCedarRecord.set(null);
      this.selectedCedarTemplate.set(null);
    }
  }

  toggleEditMode(): void {
    const editMode = this.cedarFormReadonly();
    this.cedarFormReadonly.set(!editMode);
  }

  onCedarFormSubmit(data: CedarRecordDataBinding): void {
    const selectedRecord = this.selectedCedarRecord();
    if (!this.resourceId || !selectedRecord) return;
    if (selectedRecord.id) {
      this.actions
        .updateCedarRecord(data, selectedRecord.id, this.resourceId, ResourceType.File)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(() => {
            const cedarUrl = this.file()?.links.info;
            if (cedarUrl) {
              return this.actions.getCedarRecords(this.resourceId, ResourceType.File, cedarUrl);
            }
            return [];
          })
        )
        .subscribe(() => {
          this.cedarFormReadonly.set(true);
          this.updateSelectedCedarRecord(selectedRecord.id!);
          this.toastService.showSuccess('files.detail.toast.cedarUpdated');
        });
    }
  }

  private updateSelectedCedarRecord(recordId: string): void {
    const records = this.cedarRecords();
    if (!records) return;

    const record = records.find((r) => r.id === recordId);
    if (record) {
      this.selectedCedarRecord.set(record);
    }
  }

  private loadCedarRecord(recordId: string): void {
    const records = this.cedarRecords();
    const templates = this.cedarTemplates();
    if (!records) {
      return;
    }
    const record = records.find((r) => r.id === recordId);
    if (!record) {
      return;
    }
    this.selectedCedarRecord.set(record);
    this.cedarFormReadonly.set(true);
    const templateId = record.relationships?.template?.data?.id;
    if (templateId && templates?.data) {
      const template = templates.data.find((t) => t.id === templateId);
      if (template) {
        this.selectedCedarTemplate.set(template);
      } else {
        this.selectedCedarTemplate.set(null);
        this.actions.getCedarTemplates();
      }
    } else {
      this.selectedCedarTemplate.set(null);
      this.actions.getCedarTemplates();
    }
  }

  private getMfrUrlWithVersion(version?: string): string | null {
    const mfrUrl = this.file()?.links.render;
    if (!mfrUrl) return null;
    const mfrUrlObj = new URL(mfrUrl);
    const encodedDownloadUrl = mfrUrlObj.searchParams.get('url');
    if (!encodedDownloadUrl) return mfrUrl;

    const downloadUrlObj = new URL(decodeURIComponent(encodedDownloadUrl));

    if (version) downloadUrlObj.searchParams.set('version', version);

    if (this.hasViewOnly()) {
      const viewOnlyParam = getViewOnlyParam();
      if (viewOnlyParam) downloadUrlObj.searchParams.set('view_only', viewOnlyParam);
    }

    mfrUrlObj.searchParams.set('url', downloadUrlObj.toString());

    return mfrUrlObj.toString();
  }
}
