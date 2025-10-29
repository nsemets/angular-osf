import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Tag } from 'primeng/tag';

import { finalize } from 'rxjs';

import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { getPreprintDocumentType } from '@osf/features/preprints/helpers';
import { PreprintProviderDetails } from '@osf/features/preprints/models';
import { CardLabelTranslationKeys } from '@osf/shared/constants/resource-card-labels.const';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { IS_XSMALL } from '@osf/shared/helpers/breakpoints.tokens';
import { getSortedContributorsByPermissions } from '@osf/shared/helpers/sort-contributors-by-permissions';
import { ResourceModel, UserRelatedCounts } from '@osf/shared/models';
import { ResourceCardService } from '@osf/shared/services/resource-card.service';
import { StopPropagationDirective } from '@shared/directives';

import { DataResourcesComponent } from '../data-resources/data-resources.component';

import { FileSecondaryMetadataComponent } from './components/file-secondary-metadata/file-secondary-metadata.component';
import { PreprintSecondaryMetadataComponent } from './components/preprint-secondary-metadata/preprint-secondary-metadata.component';
import { ProjectSecondaryMetadataComponent } from './components/project-secondary-metadata/project-secondary-metadata.component';
import { RegistrationSecondaryMetadataComponent } from './components/registration-secondary-metadata/registration-secondary-metadata.component';
import { UserSecondaryMetadataComponent } from './components/user-secondary-metadata/user-secondary-metadata.component';

@Component({
  selector: 'osf-resource-card',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    DatePipe,
    NgOptimizedImage,
    TranslatePipe,
    DataResourcesComponent,
    Tag,
    UserSecondaryMetadataComponent,
    RegistrationSecondaryMetadataComponent,
    ProjectSecondaryMetadataComponent,
    PreprintSecondaryMetadataComponent,
    FileSecondaryMetadataComponent,
    StopPropagationDirective,
  ],
  templateUrl: './resource-card.component.html',
  styleUrl: './resource-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCardComponent {
  private resourceCardService = inject(ResourceCardService);
  private translateService = inject(TranslateService);

  isSmall = toSignal(inject(IS_XSMALL));

  resource = input.required<ResourceModel>();
  provider = input<PreprintProviderDetails | null>();
  userRelatedCounts = signal<UserRelatedCounts | null>(null);

  ResourceType = ResourceType;
  limit = 4;

  cardTypeLabel = computed(() => {
    const item = this.resource();
    if (item.resourceType === ResourceType.Preprint) {
      if (this.provider()) {
        return getPreprintDocumentType(this.provider()!, this.translateService).singularCapitalized;
      }
    }
    return CardLabelTranslationKeys[item.resourceType]!;
  });

  displayTitle = computed(() => {
    const resource = this.resource();
    const resourceType = resource.resourceType;

    if (resourceType === ResourceType.Agent) {
      return resource.name;
    } else if (resourceType === ResourceType.File) {
      return resource.fileName;
    }
    return resource.title;
  });

  orcids = computed(() => {
    const identifiers = this.resource().identifiers;

    return identifiers.filter((value) => value.includes('orcid.org'));
  });

  affiliatedEntities = computed(() => {
    const resource = this.resource();
    const resourceType = resource.resourceType;
    if (resourceType === ResourceType.Agent) {
      if (resource.affiliations) {
        return resource.affiliations;
      }
    } else if (resource.creators) {
      return getSortedContributorsByPermissions(resource);
    } else if (resource.isContainedBy?.creators) {
      return getSortedContributorsByPermissions(resource.isContainedBy);
    }

    return [];
  });

  isWithdrawn = computed(() => {
    return !!this.resource().dateWithdrawn;
  });

  dateFields = computed(() => {
    const resource = this.resource();
    switch (resource.resourceType) {
      case ResourceType.Agent:
        return [];
      case ResourceType.Registration:
      case ResourceType.RegistrationComponent:
        return [
          {
            label: 'resourceCard.labels.dateRegistered',
            date: resource.dateCreated,
          },
          {
            label: 'resourceCard.labels.dateModified',
            date: resource.dateModified,
          },
        ];
      default:
        return [
          {
            label: 'resourceCard.labels.dateCreated',
            date: resource.dateCreated,
          },
          {
            label: 'resourceCard.labels.dateModified',
            date: resource.dateModified,
          },
        ];
    }
  });

  isLoading = signal(false);
  dataIsLoaded = false;

  onOpen() {
    if (!this.resource() || this.dataIsLoaded || this.resource().resourceType !== ResourceType.Agent) {
      return;
    }

    const userId = this.resource()?.absoluteUrl.split('/').pop();

    if (!userId) {
      return;
    }

    this.isLoading.set(true);
    this.resourceCardService
      .getUserRelatedCounts(userId)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.dataIsLoaded = true;
        })
      )
      .subscribe((res) => {
        this.userRelatedCounts.set(res);
      });
  }
}
