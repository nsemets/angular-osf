import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
import { ProjectOverviewSubject } from '@osf/features/project/overview/models';
import { GetProjectById, ProjectOverviewSelectors } from '@osf/features/project/overview/store';
import { SubHeaderComponent } from '@shared/components';

@Component({
  selector: 'osf-project-metadata',
  imports: [
    SubHeaderComponent,
    TranslatePipe,
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
  ],
  templateUrl: './project-metadata.component.html',
  styleUrl: './project-metadata.component.scss',
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMetadataComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);

  protected actions = createDispatchMap({
    getProject: GetProjectById,
  });

  protected currentProject = select(ProjectOverviewSelectors.getProject);

  ngOnInit(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];

    if (projectId) {
      this.actions.getProject(projectId);
    }
  }

  // Handle tags changes and refresh project data
  onTagsChanged(tags: string[]): void {
    // TODO: Call API to update tags
    console.log('Tags updated:', tags);

    // Refresh project data after successful update
    this.refreshProjectData();
  }

  // Handle subjects changes and refresh project data
  onSubjectsChanged(subjects: ProjectOverviewSubject[]): void {
    // TODO: Call API to update subjects
    console.log('Subjects updated:', subjects);

    // Refresh project data after successful update
    this.refreshProjectData();
  }

  // Auto refresh functionality
  private refreshProjectData(): void {
    const projectId = this.route.parent?.parent?.snapshot.params['id'];
    if (projectId) {
      this.actions.getProject(projectId);
    }
  }

  openEditContributorDialog(): void {
    // TODO: Implement contributor edit dialog
  }

  openEditDescriptionDialog(): void {
    // TODO: Implement description edit dialog
  }

  openEditResourceInformationDialog(): void {
    // TODO: Implement resource information edit dialog
  }

  openEditLicenseDialog(): void {
    // TODO: Implement license edit dialog
  }

  openEditPublicationDoiDialog(): void {
    // TODO: Implement publication DOI edit dialog
  }

  openEditTagsDialog(): void {
    // No longer needed - using inline editing
  }

  openEditSubjectsDialog(): void {
    // No longer needed - using inline editing
  }

  openEditFundingDialog(): void {
    // TODO: Implement funding edit dialog
  }

  openEditAffiliatedInstitutionsDialog(): void {
    // TODO: Implement affiliated institutions edit dialog
  }
}
