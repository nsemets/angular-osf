import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ConfirmationService } from 'primeng/api';
import { Card } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';

import { EMPTY, filter, switchMap } from 'rxjs';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  DescriptionDialogComponent,
  DoiDialogComponent,
  FundingDialogComponent,
  LicenseDialogComponent,
  ResourceInformationDialogComponent,
} from '@osf/features/project/metadata/dialogs';
import {
  GetCustomItemMetadata,
  GetFundersList,
  ProjectMetadataSelectors,
  UpdateCustomItemMetadata,
} from '@osf/features/project/metadata/store';
import { ProjectOverviewSubject } from '@osf/features/project/overview/models';
import { GetProjectById, ProjectOverviewSelectors, UpdateProjectDetails } from '@osf/features/project/overview/store';
import { SubHeaderComponent } from '@shared/components';
import { ToastService } from '@shared/services';
import { LoadAllLicenses } from '@shared/stores';

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

  protected actions = createDispatchMap({
    getProject: GetProjectById,
    updateProjectDetails: UpdateProjectDetails,
    getCustomItemMetadata: GetCustomItemMetadata,
    updateCustomItemMetadata: UpdateCustomItemMetadata,
    getFundersList: GetFundersList,
  });

  protected currentProject = select(ProjectOverviewSelectors.getProject);
  protected customItemMetadata = select(ProjectMetadataSelectors.getCustomItemMetadata);
  protected fundersList = select(ProjectMetadataSelectors.getFundersList);

  constructor() {
    effect(() => {
      if (this.currentProject()) {
        this.store.dispatch(new LoadAllLicenses());
      }
    });
  }

  ngOnInit(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];

    if (projectId) {
      this.actions.getProject(projectId);
      this.actions.getCustomItemMetadata(projectId);
    }
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
    // TODO: Call API to update subjects
    console.log('Subjects updated:', subjects);
  }

  private refreshProjectData(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];
    if (projectId) {
      this.actions.getProject(projectId);
      this.actions.getCustomItemMetadata(projectId);
    }
  }

  openEditContributorDialog(): void {
    // TODO: Implement contributor edit dialog
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
          if (result && result.description) {
            const projectId = this.currentProject()?.id;
            if (projectId) {
              return this.store.dispatch(
                new UpdateProjectDetails(projectId, {
                  description: result.description,
                })
              );
            }
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.description.updated'),
        error: () => this.toastService.showError('project.metadata.description.updateFailed'),
      });
  }

  openEditResourceInformationDialog(): void {
    const dialogRef = this.dialogService.open(ResourceInformationDialogComponent, {
      header: this.translateService.instant('project.metadata.resourceInformation.dialog.header'),
      width: '500px',
      data: {
        currentProject: this.currentProject(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          if (result && (result.resourceType || result.resourceLanguage)) {
            const projectId = this.currentProject()?.id;
            if (projectId) {
              const currentMetadata = this.customItemMetadata() || {
                language: 'en',
                resource_type_general: 'Dataset',
                funders: [],
              };

              const updatedMetadata = {
                ...currentMetadata,
                language: result.resourceLanguage || currentMetadata.language,
                resource_type_general: result.resourceType || currentMetadata.resource_type_general,
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
        error: () => this.toastService.showError('project.metadata.affiliatedInstitutions.updateFailed'),
      });
  }

  handleEditDoi(): void {
    const dialogRef = this.dialogService.open(DoiDialogComponent, {
      header: this.translateService.instant('project.metadata.doi.dialog.createConfirm.header'),
      width: '500px',
      data: {
        currentProject: this.currentProject(),
      },
    });

    dialogRef.onClose
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          if (result && result.confirmed) {
            const projectId = this.currentProject()?.id;
            if (projectId) {
              // TODO: Implement DOI creation API call
              console.log('DOI confirmed for project:', projectId);
              this.refreshProjectData();
              return EMPTY; // Replace with actual DOI creation API call when available
            }
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: () => this.toastService.showSuccess('project.metadata.doi.created'),
        error: () => this.toastService.showError('project.metadata.doi.createFailed'),
      });
  }
}
