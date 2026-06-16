import { TranslatePipe } from '@ngx-translate/core';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { collectionFilterNames } from '@osf/features/collections/constants';
import { CEDAR_VIEWER_CONFIG } from '@osf/features/metadata/constants';
import { CedarMetadataDataTemplateJsonApi, CedarMetadataRecordData } from '@osf/features/metadata/models';
import { StopPropagationDirective } from '@osf/shared/directives/stop-propagation.directive';
import { CollectionSubmission } from '@osf/shared/models/collections/collections.model';
import { KeyValueModel } from '@osf/shared/models/common/key-value.model';
import { CollectionStatusSeverityPipe } from '@osf/shared/pipes/collection-status-severity.pipe';

@Component({
  selector: 'osf-overview-collections',
  imports: [
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    TranslatePipe,
    Skeleton,
    Tag,
    Button,
    StopPropagationDirective,
    RouterLink,
    CollectionStatusSeverityPipe,
  ],
  templateUrl: './overview-collections.component.html',
  styleUrl: './overview-collections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class OverviewCollectionsComponent {
  projectSubmissions = input<CollectionSubmission[] | null>(null);
  isProjectSubmissionsLoading = input<boolean>(false);
  isCedarMode = input<boolean>(false);
  cedarRecords = input<CedarMetadataRecordData[] | null>(null);
  cedarTemplates = input<CedarMetadataDataTemplateJsonApi[] | null>(null);

  cedarViewerConfig = CEDAR_VIEWER_CONFIG;

  cedarRecordByTemplateId = computed(() => {
    const records = this.cedarRecords();
    return new Map(
      records?.flatMap((record) => {
        const templateId = record.relationships?.template?.data?.id;
        return templateId ? [[templateId, record] as const] : [];
      }) ?? []
    );
  });

  cedarTemplateById = computed(() => {
    const templates = this.cedarTemplates();
    return new Map(templates?.map((t) => [t.id, t] as const) ?? []);
  });

  getSubmissionAttributes(submission: CollectionSubmission): KeyValueModel[] {
    const attributes: KeyValueModel[] = [];

    for (const filter of collectionFilterNames) {
      const value = submission[filter.key as keyof CollectionSubmission];

      if (value) {
        attributes.push({
          key: filter.key,
          label: filter.label,
          value: String(value),
        });
      }
    }

    return attributes;
  }
}
