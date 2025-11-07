import { createDispatchMap, select } from '@ngxs/store';

import { map } from 'rxjs';

import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { HelpScoutService } from '@core/services/help-scout.service';
import { PrerenderReadyService } from '@core/services/prerender-ready.service';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { DataciteService } from '@osf/shared/services/datacite/datacite.service';
import { MetaTagsService } from '@osf/shared/services/meta-tags.service';
import { ContributorsSelectors, GetBibliographicContributors } from '@osf/shared/stores/contributors';

import { GetProjectById, GetProjectIdentifiers, ProjectOverviewSelectors } from './overview/store';

@Component({
  selector: 'osf-project',
  imports: [RouterOutlet],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class ProjectComponent implements OnDestroy {
  @HostBinding('class') classes = 'flex flex-1 flex-column w-full';

  private readonly helpScoutService = inject(HelpScoutService);
  private readonly metaTags = inject(MetaTagsService);
  private readonly dataciteService = inject(DataciteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly datePipe = inject(DatePipe);
  private readonly prerenderReady = inject(PrerenderReadyService);

  readonly identifiersForDatacite$ = toObservable(select(ProjectOverviewSelectors.getIdentifiers)).pipe(
    map((identifiers) => (identifiers?.length ? { identifiers } : null))
  );

  currentProject = select(ProjectOverviewSelectors.getProject);
  isProjectLoading = select(ProjectOverviewSelectors.getProjectLoading);
  readonly bibliographicContributors = select(ContributorsSelectors.getBibliographicContributors);
  readonly isBibliographicContributorsLoading = select(ContributorsSelectors.isBibliographicContributorsLoading);
  readonly license = select(ProjectOverviewSelectors.getLicense);
  readonly isLicenseLoading = select(ProjectOverviewSelectors.isLicenseLoading);

  private projectId = toSignal(this.route.params.pipe(map((params) => params['id'])));

  private readonly allDataLoaded = computed(
    () =>
      !this.isProjectLoading() &&
      !this.isBibliographicContributorsLoading() &&
      !this.isLicenseLoading() &&
      !!this.currentProject()
  );

  private readonly lastMetaTagsProjectId = signal<string | null>(null);

  private readonly actions = createDispatchMap({
    getProject: GetProjectById,
    getIdentifiers: GetProjectIdentifiers,
    getBibliographicContributors: GetBibliographicContributors,
  });

  private readonly metaTagsData = computed(() => {
    const project = this.currentProject();

    if (!project) return null;

    const keywords = [...(project.tags || [])];

    if (project.category) {
      keywords.push(project.category);
    }

    return {
      osfGuid: project.id,
      title: project.title,
      description: project.description,
      url: project.links?.iri,
      // license: project.license?.name,
      publishedDate: this.datePipe.transform(project.dateCreated, 'yyyy-MM-dd'),
      modifiedDate: this.datePipe.transform(project.dateModified, 'yyyy-MM-dd'),
      keywords,
      // institution: project.affiliatedInstitutions?.map((institution) => institution.name),
      // contributors: project?.contributors?.map((contributor) => ({
      //   fullName: contributor.fullName,
      //   givenName: contributor.givenName,
      //   familyName: contributor.familyName,
      // })),
    };
  });

  constructor() {
    this.prerenderReady.setNotReady();
    this.helpScoutService.setResourceType('project');

    effect(() => {
      const id = this.projectId();

      if (id) {
        this.actions.getProject(id);
        this.actions.getIdentifiers(id);
        this.actions.getBibliographicContributors(id, ResourceType.Project);
      }
    });

    effect(() => {
      if (this.allDataLoaded()) {
        const currentProjectId = this.projectId();
        const lastSetProjectId = this.lastMetaTagsProjectId();
        const metaTagsData = this.metaTagsData();

        if (currentProjectId && currentProjectId !== lastSetProjectId && metaTagsData) {
          this.metaTags.updateMetaTags(metaTagsData, this.destroyRef);
        }
      }
    });

    this.dataciteService
      .logIdentifiableView(this.identifiersForDatacite$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.helpScoutService.unsetResourceType();
  }
}
