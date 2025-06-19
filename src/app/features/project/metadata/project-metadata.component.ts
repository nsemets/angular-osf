import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ConfirmationService } from 'primeng/api';
import { Card } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { TabPanel, TabView } from 'primeng/tabview';

import { EMPTY, filter, switchMap } from 'rxjs';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@osf/core/store/user';
// Import contributors functionality
import { ContributorsSelectors, GetAllContributors } from '@osf/features/project/contributors/store';
import {
  ProjectMetadataAffiliatedInstitutionsComponent,
  ProjectMetadataContributorsComponent,
  ProjectMetadataDescriptionComponent,
  ProjectMetadataFundingComponent,
  ProjectMetadataLicenseComponent,
  ProjectMetadataPublicationDoiComponent,
  ProjectMetadataResourceInformationComponent,
  ProjectMetadataSubjectsComponent,
  ProjectMetadataTagsComponent,
} from '@osf/features/project/metadata/components';
import {
  AffiliatedInstitutionsDialogComponent,
  ContributorsDialogComponent,
  DescriptionDialogComponent,
  DoiDialogComponent,
  FundingDialogComponent,
  LicenseDialogComponent,
  ResourceInformationDialogComponent,
} from '@osf/features/project/metadata/dialogs';
import {
  GetCedarMetadataRecords,
  GetCustomItemMetadata,
  GetFundersList,
  GetProjectForMetadata,
  GetUserInstitutions,
  ProjectMetadataSelectors,
  UpdateCustomItemMetadata,
  UpdateProjectDetails,
} from '@osf/features/project/metadata/store';
import { ProjectOverviewSubject } from '@osf/features/project/overview/models';
import { SubHeaderComponent } from '@shared/components';
import { ToastService } from '@shared/services';
import { GetSubjects, SubjectsSelectors, UpdateProjectSubjects } from '@shared/stores';

@Component({
  selector: 'osf-project-metadata',
  imports: [
    SubHeaderComponent,
    Card,
    DatePipe,

    ProjectMetadataContributorsComponent,
    ProjectMetadataDescriptionComponent,
    ProjectMetadataResourceInformationComponent,
    ProjectMetadataLicenseComponent,
    ProjectMetadataPublicationDoiComponent,
    ProjectMetadataTagsComponent,
    ProjectMetadataSubjectsComponent,
    ProjectMetadataFundingComponent,
    ProjectMetadataAffiliatedInstitutionsComponent,
    TranslatePipe,
    TabView,
    TabPanel,
  ],
  templateUrl: './project-metadata.component.html',
  styleUrl: './project-metadata.component.scss',
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMetadataComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);
  private readonly store = inject(Store);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toastService = inject(ToastService);

  activeTabIndex = signal<number>(0);
  tabs = signal<{ id: string; label: string; type: 'project' | 'cedar' }[]>([]);

  protected actions = createDispatchMap({
    getProject: GetProjectForMetadata,
    updateProjectDetails: UpdateProjectDetails,
    updateProjectSubjects: UpdateProjectSubjects,
    getCustomItemMetadata: GetCustomItemMetadata,
    updateCustomItemMetadata: UpdateCustomItemMetadata,
    getFundersList: GetFundersList,
    getContributors: GetAllContributors,
    getUserInstitutions: GetUserInstitutions,
    getHighlightedSubjects: GetSubjects,
    getCedarRecords: GetCedarMetadataRecords,
  });

  protected currentProject = select(ProjectMetadataSelectors.getProject);
  protected customItemMetadata = select(ProjectMetadataSelectors.getCustomItemMetadata);
  protected fundersList = select(ProjectMetadataSelectors.getFundersList);
  protected contributors = select(ContributorsSelectors.getContributors);
  protected isContributorsLoading = select(ContributorsSelectors.isContributorsLoading);
  protected highlightedSubjects = select(SubjectsSelectors.getHighlightedSubjects);
  protected highlightedSubjectsLoading = select(SubjectsSelectors.getHighlightedSubjectsLoading);
  protected currentUser = select(UserSelectors.getCurrentUser);
  protected cedarRecords = select(ProjectMetadataSelectors.getCedarRecords);

  constructor() {
    effect(() => {
      const records = this.cedarRecords();
      const project = this.currentProject();
      if (!project) return;

      const baseTabs = [{ id: 'project', label: project.title || 'Project Metadata', type: 'project' as const }];

      const cedarTabs = records.map((record) => ({
        id: record.id || '',
        label: record.embeds?.template?.data?.attributes?.schema_name || `Record ${record.id}`,
        type: 'cedar' as const,
      }));

      this.tabs.set([...baseTabs, ...cedarTabs]);
    });
  }

  ngOnInit(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];

    if (projectId) {
      this.actions.getProject(projectId);
      this.actions.getCustomItemMetadata(projectId);
      this.actions.getContributors(projectId);
      this.actions.getHighlightedSubjects();
      this.actions.getCedarRecords(projectId);

      const user = this.currentUser();
      if (user?.id) {
        this.actions.getUserInstitutions(user.id);
      }
    }

    this.route.paramMap.subscribe((params) => {
      const recordId = params.get('recordId');
      if (!recordId) {
        this.activeTabIndex.set(0);
        return;
      }

      const index = this.tabs().findIndex((tab) => tab.id === recordId);
      if (index >= 0) {
        this.activeTabIndex.set(index);
      }
    });
  }

  onTagsChanged(tags: string[]): void {
    const projectId = this.currentProject()?.id;
    if (projectId) {
      this.actions.updateProjectDetails(projectId, { tags });
    }
  }

  openAddRecord(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  onSubjectsChanged(subjects: ProjectOverviewSubject[]): void {
    const projectId = this.currentProject()?.id;
    if (projectId) {
      const subjectIds = subjects.map((subject) => subject.id);
      this.actions.updateProjectSubjects(projectId, subjectIds);
    }
  }

  private refreshProjectData(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];
    if (projectId) {
      this.actions.getProject(projectId);
      this.actions.getCustomItemMetadata(projectId);
      this.actions.getContributors(projectId);

      const user = this.currentUser();
      if (user?.id) {
        this.actions.getUserInstitutions(user.id);
      }
    }
  }

  openEditContributorDialog(): void {
    const dialogRef = this.dialogService.open(ContributorsDialogComponent, {
      header: this.translateService.instant('project.metadata.contributors.dialog.header'),
      width: '800px',
      data: {
        projectId: this.currentProject()?.id,
        contributors: this.contributors(),
        isLoading: this.isContributorsLoading(),
      },
    });

    dialogRef.onClose.pipe(filter((result) => !!result)).subscribe({
      next: (result) => {
        if (result.refresh || result.saved) {
          this.refreshContributorsData();
          this.toastService.showSuccess('project.metadata.contributors.updated');
        }
      },
      error: () => this.toastService.showError('project.metadata.contributors.updateFailed'),
    });
  }

  private refreshContributorsData(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];
    if (projectId) {
      this.actions.getContributors(projectId);
    }
  }

  openEditDescriptionDialog(): void {
    const dialogRef = this.dialogService.open(DescriptionDialogComponent, {
      header: this.translateService.instant('project.metadata.description.dialog.header'),
      width: '500px',
      data: {
        currentProject: this.currentProject(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          const projectId = this.currentProject()?.id;
          if (projectId) {
            return this.store.dispatch(
              new UpdateProjectDetails(projectId, {
                description: result,
              })
            );
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this.toastService.showSuccess('project.metadata.description.updated');
          const projectId = this.currentProject()?.id;
          if (projectId) {
            this.actions.getProject(projectId);
          }
        },
      });
  }

  openEditResourceInformationDialog(): void {
    const dialogRef = this.dialogService.open(ResourceInformationDialogComponent, {
      header: this.translateService.instant('project.metadata.resourceInformation.dialog.header'),
      width: '500px',
      data: {
        currentProject: this.currentProject(),
        customItemMetadata: this.customItemMetadata(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          if (result && (result.resourceType || result.resourceLanguage)) {
            const projectId = this.currentProject()?.id;
            if (projectId) {
              const currentMetadata = this.customItemMetadata();

              const updatedMetadata = {
                ...currentMetadata,
                language: result.resourceLanguage || currentMetadata?.language,
                resource_type_general: result.resourceType || currentMetadata?.resource_type_general,
                funder: currentMetadata?.funders,
              };

              return this.actions.updateCustomItemMetadata(projectId, updatedMetadata);
            }
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.resourceInformation.updated'),
        error: () => this.toastService.showError('project.metadata.resourceInformation.updateFailed'),
      });
  }

  openEditLicenseDialog(): void {
    const dialogRef = this.dialogService.open(LicenseDialogComponent, {
      header: this.translateService.instant('project.metadata.license.dialog.header'),
      width: '600px',
      data: {
        currentProject: this.currentProject(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          if (result && result.licenseName && result.licenseId) {
            const projectId = this.currentProject()?.id;
            if (projectId) {
              return this.store.dispatch(
                new UpdateProjectDetails(projectId, {
                  node_license: {
                    id: result.licenseId,
                    type: 'node-license',
                  },
                })
              );
            }
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.license.updated'),
      });
  }

  openEditFundingDialog(): void {
    this.actions.getFundersList();

    const dialogRef = this.dialogService.open(FundingDialogComponent, {
      header: this.translateService.instant('project.metadata.funding.dialog.header'),
      width: '600px',
      data: {
        currentProject: this.currentProject(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          if (result && result.fundingEntries) {
            const projectId = this.currentProject()?.id;
            if (projectId) {
              const currentMetadata = this.customItemMetadata() || {
                language: 'en',
                resource_type_general: 'Dataset',
                funders: [],
              };

              const updatedMetadata = {
                ...currentMetadata,
                funders: result.fundingEntries.map(
                  (entry: {
                    funderName?: string;
                    funderIdentifier?: string;
                    funderIdentifierType?: string;
                    awardNumber?: string;
                    awardUri?: string;
                    awardTitle?: string;
                  }) => ({
                    funder_name: entry.funderName || '',
                    funder_identifier: entry.funderIdentifier || '',
                    funder_identifier_type: entry.funderIdentifierType || '',
                    award_number: entry.awardNumber || '',
                    award_uri: entry.awardUri || '',
                    award_title: entry.awardTitle || '',
                  })
                ),
              };

              return this.actions.updateCustomItemMetadata(projectId, updatedMetadata);
            }
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.funding.updated'),
      });
  }

  openEditAffiliatedInstitutionsDialog(): void {
    const dialogRef = this.dialogService.open(AffiliatedInstitutionsDialogComponent, {
      header: this.translateService.instant('project.metadata.affiliatedInstitutions.dialog.header'),
      width: '500px',
      data: {
        currentProject: this.currentProject(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          if (result && result.institutions) {
            // TODO: Implement affiliated institutions update API call
            this.refreshProjectData();
            return EMPTY; // Replace with actual API call when available
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.affiliatedInstitutions.updated'),
      });
  }

  handleEditDoi(): void {
    const dialogRef = this.dialogService.open(DoiDialogComponent, {
      header: this.translateService.instant('project.metadata.doi.dialog.createConfirm.header'),
      width: '500px',
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          const projectId = this.currentProject()?.id;
          if (projectId) {
            // TODO: Implement DOI creation API call
            console.log('DOI confirmed for project:', projectId);
            this.refreshProjectData();
            return EMPTY;
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.doi.created'),
        error: () => this.toastService.showError('project.metadata.doi.createFailed'),
      });
  }

  onTabChange(index: number): void {
    this.activeTabIndex.set(index);
    const tab = this.tabs()[index];
    if (tab.type === 'cedar') {
      this.router.navigate([tab.id], { relativeTo: this.route });
    } else {
      this.router.navigate([], { relativeTo: this.route });
    }
  }
}
