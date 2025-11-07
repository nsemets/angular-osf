import { MockComponents } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliatedInstitutionsViewComponent } from '@osf/shared/components/affiliated-institutions-view/affiliated-institutions-view.component';
import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { ResourceCitationsComponent } from '@osf/shared/components/resource-citations/resource-citations.component';
import { ResourceDoiComponent } from '@osf/shared/components/resource-doi/resource-doi.component';
import { ResourceLicenseComponent } from '@osf/shared/components/resource-license/resource-license.component';
import { SubjectsListComponent } from '@osf/shared/components/subjects-list/subjects-list.component';
import { TagsListComponent } from '@osf/shared/components/tags-list/tags-list.component';

import { OverviewCollectionsComponent } from '../overview-collections/overview-collections.component';
import { OverviewSupplementsComponent } from '../overview-supplements/overview-supplements.component';

import { ProjectOverviewMetadataComponent } from './project-overview-metadata.component';

describe('ProjectOverviewMetadataComponent', () => {
  let component: ProjectOverviewMetadataComponent;
  let fixture: ComponentFixture<ProjectOverviewMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProjectOverviewMetadataComponent,
        MockComponents(
          ResourceCitationsComponent,
          OverviewCollectionsComponent,
          AffiliatedInstitutionsViewComponent,
          ContributorsListComponent,
          ResourceDoiComponent,
          ResourceLicenseComponent,
          SubjectsListComponent,
          TagsListComponent,
          OverviewSupplementsComponent
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectOverviewMetadataComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
