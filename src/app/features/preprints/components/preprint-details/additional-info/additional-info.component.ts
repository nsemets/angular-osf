import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { PreprintSelectors } from '@osf/features/preprints/store/preprint';
import { LicenseDisplayComponent } from '@osf/shared/components';
import { ResourceType } from '@shared/enums';
import { FetchSelectedSubjects, SubjectsSelectors } from '@shared/stores/subjects';

import { CitationSectionComponent } from '../citation-section/citation-section.component';

@Component({
  selector: 'osf-preprint-additional-info',
  imports: [Card, TranslatePipe, Tag, Skeleton, DatePipe, CitationSectionComponent, LicenseDisplayComponent],
  templateUrl: './additional-info.component.html',
  styleUrl: './additional-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalInfoComponent {
  private actions = createDispatchMap({
    fetchSubjects: FetchSelectedSubjects,
  });
  private router = inject(Router);

  preprintProviderId = input.required<string>();

  preprint = select(PreprintSelectors.getPreprint);
  isPreprintLoading = select(PreprintSelectors.isPreprintLoading);

  subjects = select(SubjectsSelectors.getSelectedSubjects);
  areSelectedSubjectsLoading = select(SubjectsSelectors.areSelectedSubjectsLoading);

  license = computed(() => {
    const preprint = this.preprint();
    if (!preprint) return null;
    return preprint.embeddedLicense;
  });
  licenseOptionsRecord = computed(() => {
    return (this.preprint()?.licenseOptions ?? {}) as Record<string, string>;
  });

  skeletonData = Array.from({ length: 5 }, () => null);

  constructor() {
    effect(() => {
      const preprint = this.preprint();
      if (!preprint) return;

      this.actions.fetchSubjects(this.preprint()!.id, ResourceType.Preprint);
    });
  }

  tagClicked(tag: string) {
    this.router.navigate(['/search'], { queryParams: { search: tag } });
  }
}
