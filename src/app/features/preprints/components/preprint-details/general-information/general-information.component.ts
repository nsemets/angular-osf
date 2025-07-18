import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';

import { ChangeDetectionStrategy, Component, computed, effect, OnDestroy, signal } from '@angular/core';

import { ApplicabilityStatus, PreregLinkInfo } from '@osf/features/preprints/enums';
import { PreprintSelectors } from '@osf/features/preprints/store/preprint';
import { TruncatedTextComponent } from '@shared/components';
import { ResourceType } from '@shared/enums';
import { Institution } from '@shared/models';
import { ContributorsSelectors, GetAllContributors, ResetContributorsState } from '@shared/stores';

@Component({
  selector: 'osf-preprint-general-information',
  imports: [Card, TranslatePipe, TruncatedTextComponent, Skeleton, Select],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInformationComponent implements OnDestroy {
  readonly ApplicabilityStatus = ApplicabilityStatus;
  readonly PreregLinkInfo = PreregLinkInfo;

  private actions = createDispatchMap({
    getContributors: GetAllContributors,
    resetContributorsState: ResetContributorsState,
  });

  preprint = select(PreprintSelectors.getPreprint);
  isPreprintLoading = select(PreprintSelectors.isPreprintLoading);

  //[RNi] TODO: Implement when institutions available
  affiliatedInstitutions = signal<Institution[]>([]);

  contributors = select(ContributorsSelectors.getContributors);
  areContributorsLoading = select(ContributorsSelectors.isContributorsLoading);
  bibliographicContributors = computed(() => {
    return this.contributors().filter((contributor) => contributor.isBibliographic);
  });

  skeletonData = Array.from({ length: 5 }, () => null);
  initContributorsFlag = true;

  constructor() {
    effect(() => {
      if (!this.initContributorsFlag) return;
      const preprint = this.preprint();
      if (!preprint) return;

      this.initContributorsFlag = false;
      this.actions.getContributors(this.preprint()!.id, ResourceType.Preprint);
    });
  }

  ngOnDestroy(): void {
    this.actions.resetContributorsState();
  }
}
