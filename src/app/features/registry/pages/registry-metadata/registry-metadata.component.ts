import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { DialogService } from 'primeng/dynamicdialog';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@osf/core/store/user';
import { CustomItemMetadataRecord } from '@osf/features/project/metadata/models';
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
  GetBibliographicContributors,
  GetCustomItemMetadata,
  GetFundersList,
  GetRegistryForMetadata,
  GetRegistrySubjects,
  GetUserInstitutions,
  RegistryMetadataSelectors,
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

  tabs = signal<{ id: string; label: string; type: 'registry' }[]>([]);
  protected readonly selectedTab = signal('registry');

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

  constructor() {
    effect(() => {
      const registry = this.currentRegistry();
      if (!registry) return;

      const baseTabs = [{ id: 'registry', label: registry.title, type: 'registry' as const }];

      this.tabs.set(baseTabs);
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
}
