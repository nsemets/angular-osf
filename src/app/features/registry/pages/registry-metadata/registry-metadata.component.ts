import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { DialogService } from 'primeng/dynamicdialog';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@osf/core/store/user';
import { CedarTemplateFormComponent } from '@osf/features/project/metadata/components';
import {
  CedarMetadataDataTemplateJsonApi,
  CedarMetadataRecord,
  CedarMetadataRecordData,
  CedarRecordDataBinding,
  CustomItemMetadataRecord,
} from '@osf/features/project/metadata/models';
import { ProjectOverview } from '@osf/features/project/overview/models';
import {
  ContributorsSelectors,
  FetchChildrenSubjects,
  FetchSelectedSubjects,
  FetchSubjects,
  GetAllContributors,
  SubjectsSelectors,
  UpdateResourceSubjects,
} from '@osf/shared/stores';
import { LoadingSpinnerComponent, SubHeaderComponent } from '@shared/components';
import { SharedMetadataComponent } from '@shared/components/shared-metadata/shared-metadata.component';
import { ResourceType } from '@shared/enums';
import { SubjectModel } from '@shared/models';
import { CustomConfirmationService, LoaderService, ToastService } from '@shared/services';

import {
  CreateCedarMetadataRecord,
  GetBibliographicContributors,
  GetCedarMetadataTemplates,
  GetCustomItemMetadata,
  GetFundersList,
  GetRegistryCedarMetadataRecords,
  GetRegistryForMetadata,
  GetRegistrySubjects,
  GetUserInstitutions,
  RegistryMetadataSelectors,
  UpdateCedarMetadataRecord,
  UpdateCustomItemMetadata,
  UpdateRegistryDetails,
} from '../../store/registry-metadata';

@Component({
  selector: 'osf-registry-metadata',
  imports: [
    SubHeaderComponent,
    TranslatePipe,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    LoadingSpinnerComponent,
    SharedMetadataComponent,
    CedarTemplateFormComponent,
  ],
  templateUrl: './registry-metadata.component.html',
  styleUrl: './registry-metadata.component.scss',
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RegistryMetadataComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);
  private readonly toastService = inject(ToastService);
  private readonly loaderService = inject(LoaderService);
  private readonly customConfirmationService = inject(CustomConfirmationService);

  private registryId = '';

  tabs = signal<{ id: string; label: string; type: 'registry' | 'cedar' }[]>([]);
  protected readonly selectedTab = signal('registry');

  selectedCedarRecord = signal<CedarMetadataRecordData | null>(null);
  selectedCedarTemplate = signal<CedarMetadataDataTemplateJsonApi | null>(null);
  cedarFormReadonly = signal<boolean>(true);

  protected actions = createDispatchMap({
    getRegistry: GetRegistryForMetadata,
    getBibliographicContributors: GetBibliographicContributors,
    updateRegistryDetails: UpdateRegistryDetails,
    getCustomItemMetadata: GetCustomItemMetadata,
    updateCustomItemMetadata: UpdateCustomItemMetadata,
    getFundersList: GetFundersList,
    getContributors: GetAllContributors,
    getUserInstitutions: GetUserInstitutions,
    getRegistrySubjects: GetRegistrySubjects,
    getCedarRecords: GetRegistryCedarMetadataRecords,
    getCedarTemplates: GetCedarMetadataTemplates,
    createCedarRecord: CreateCedarMetadataRecord,
    updateCedarRecord: UpdateCedarMetadataRecord,

    fetchSubjects: FetchSubjects,
    fetchSelectedSubjects: FetchSelectedSubjects,
    fetchChildrenSubjects: FetchChildrenSubjects,
    updateResourceSubjects: UpdateResourceSubjects,
  });

  protected currentRegistry = select(RegistryMetadataSelectors.getRegistry);
  protected currentRegistryLoading = select(RegistryMetadataSelectors.getRegistryLoading);
  protected bibliographicContributors = select(RegistryMetadataSelectors.getBibliographicContributors);
  protected bibliographicContributorsLoading = select(RegistryMetadataSelectors.getBibliographicContributorsLoading);
  protected customItemMetadata = select(RegistryMetadataSelectors.getCustomItemMetadata);
  protected fundersList = select(RegistryMetadataSelectors.getFundersList);
  protected contributors = select(ContributorsSelectors.getContributors);
  protected isContributorsLoading = select(ContributorsSelectors.isContributorsLoading);
  protected currentUser = select(UserSelectors.getCurrentUser);
  protected selectedSubjects = select(SubjectsSelectors.getSelectedSubjects);
  protected isSubjectsUpdating = select(SubjectsSelectors.areSelectedSubjectsLoading);
  protected cedarRecords = select(RegistryMetadataSelectors.getCedarRecords);
  protected cedarTemplates = select(RegistryMetadataSelectors.getCedarTemplates);

  constructor() {
    effect(() => {
      const records = this.cedarRecords();
      const registry = this.currentRegistry();
      if (!registry) return;

      const baseTabs = [{ id: 'registry', label: registry.title, type: 'registry' as const }];

      const cedarTabs =
        records?.map((record) => ({
          id: record.id || '',
          label: record.embeds?.template?.data?.attributes?.schema_name || `Record ${record.id}`,
          type: 'cedar' as const,
        })) || [];

      this.tabs.set([...baseTabs, ...cedarTabs]);

      this.handleRouteBasedTabSelection();
    });

    effect(() => {
      const templates = this.cedarTemplates();
      const selectedRecord = this.selectedCedarRecord();

      if (selectedRecord && templates?.data && !this.selectedCedarTemplate()) {
        const templateId = selectedRecord.relationships?.template?.data?.id;
        if (templateId) {
          const template = templates.data.find((t) => t.id === templateId);
          if (template) {
            this.selectedCedarTemplate.set(template);
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.registryId = this.route.parent?.parent?.snapshot.params['id'];

    if (this.registryId) {
      this.actions.getRegistry(this.registryId);
      this.actions.getBibliographicContributors(this.registryId);
      this.actions.getCustomItemMetadata(this.registryId);
      this.actions.getContributors(this.registryId, ResourceType.Registration);
      this.actions.getRegistrySubjects(this.registryId);
      this.actions.getCedarRecords(this.registryId);
      this.actions.getCedarTemplates();
      this.actions.fetchSubjects(ResourceType.Registration, this.registryId, '', true);
      this.actions.fetchSelectedSubjects(this.registryId, ResourceType.Registration);

      const user = this.currentUser();
      if (user?.id) {
        this.actions.getUserInstitutions(user.id);
      }
    }
  }

  openAddRecord(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  onTagsChanged(tags: string[]): void {
    const registryId = this.currentRegistry()?.id;
    if (registryId) {
      this.actions.updateRegistryDetails(registryId, { tags });
    }
  }

  openEditContributorDialog(): void {
    // Similar implementation to project metadata
    // For now, just show the bibliographic contributors from the API
    console.log('Bibliographic contributors:', this.bibliographicContributors());
  }

  openEditDescriptionDialog(): void {
    // Similar implementation to project metadata
    console.log('Edit description for registry:', this.currentRegistry());
  }

  openEditResourceInformationDialog(): void {
    // Similar implementation to project metadata
    console.log('Edit resource information for registry:', this.currentRegistry());
  }

  openEditLicenseDialog(): void {
    // Similar implementation to project metadata
    console.log('Edit license for registry:', this.currentRegistry());
  }

  openEditFundingDialog(): void {
    this.actions.getFundersList();
    // Similar implementation to project metadata
    console.log('Edit funding for registry:', this.currentRegistry());
  }

  openEditAffiliatedInstitutionsDialog(): void {
    // Similar implementation to project metadata
    console.log('Edit affiliated institutions for registry:', this.currentRegistry());
  }

  handleEditDoi(): void {
    this.customConfirmationService.confirmDelete({
      headerKey: this.translateService.instant('project.metadata.doi.dialog.createConfirm.header'),
      messageKey: this.translateService.instant('project.metadata.doi.dialog.createConfirm.message'),
      acceptLabelKey: this.translateService.instant('common.buttons.create'),
      acceptLabelType: 'primary',
      onConfirm: () => {
        const registryId = this.currentRegistry()?.id;
        if (registryId) {
          this.actions.updateRegistryDetails(registryId, { doi: true }).subscribe({
            next: () => this.toastService.showSuccess('registry.metadata.doi.created'),
          });
        }
      },
    });
  }

  getSubjectChildren(parentId: string) {
    this.actions.fetchChildrenSubjects(parentId);
  }

  searchSubjects(search: string) {
    this.actions.fetchSubjects(ResourceType.Registration, this.registryId, search, true);
  }

  updateSelectedSubjects(subjects: SubjectModel[]) {
    this.actions.updateResourceSubjects(this.registryId, ResourceType.Registration, subjects);
  }

  getCurrentInstanceForTemplate(): ProjectOverview {
    return this.currentRegistry() as unknown as ProjectOverview;
  }

  getCustomMetadataForTemplate(): CustomItemMetadataRecord {
    return this.customItemMetadata() as unknown as CustomItemMetadataRecord;
  }

  onTabChange(tabId: string | number): void {
    const tab = this.tabs().find((x) => x.id === tabId.toString());

    if (!tab) {
      return;
    }

    this.selectedTab.set(tab.id);

    if (tab.type === 'cedar') {
      this.loadCedarRecord(tab.id);

      const currentRecordId = this.route.snapshot.paramMap.get('recordId');
      if (currentRecordId !== tab.id) {
        this.router.navigate(['metadata', tab.id], { relativeTo: this.route.parent?.parent });
      }
    } else {
      this.selectedCedarRecord.set(null);
      this.selectedCedarTemplate.set(null);

      const currentRecordId = this.route.snapshot.paramMap.get('recordId');
      if (currentRecordId) {
        this.router.navigate(['metadata'], { relativeTo: this.route.parent?.parent });
      }
    }
  }

  onCedarFormEdit(): void {
    this.cedarFormReadonly.set(false);
  }

  onCedarFormSubmit(data: CedarRecordDataBinding): void {
    const registryId = this.currentRegistry()?.id;
    const selectedRecord = this.selectedCedarRecord();

    if (!registryId || !selectedRecord) return;

    const model = {
      data: {
        type: 'cedar_metadata_records' as const,
        attributes: {
          metadata: data.data,
          is_published: false,
        },
        relationships: {
          template: {
            data: {
              type: 'cedar-metadata-templates' as const,
              id: data.id,
            },
          },
          target: {
            data: {
              type: 'registrations' as const,
              id: registryId,
            },
          },
        },
      },
    } as unknown as CedarMetadataRecord;

    if (selectedRecord.id) {
      this.actions
        .updateCedarRecord(model, selectedRecord.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.cedarFormReadonly.set(true);
            this.toastService.showSuccess('CEDAR record updated successfully');
            this.actions.getCedarRecords(registryId);
          },
        });
    }
  }

  onCedarFormChangeTemplate(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
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

  private handleRouteBasedTabSelection(): void {
    const recordId = this.route.snapshot.paramMap.get('recordId');

    if (!recordId) {
      this.selectedTab.set('registry');
      this.selectedCedarRecord.set(null);
      this.selectedCedarTemplate.set(null);
      return;
    }

    const tab = this.tabs().find((tab) => tab.id === recordId);

    if (tab) {
      this.selectedTab.set(tab.id);

      if (tab.type === 'cedar') {
        this.loadCedarRecord(tab.id);
      }
    }
  }
}
