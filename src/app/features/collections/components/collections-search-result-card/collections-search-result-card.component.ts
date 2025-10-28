import { TranslatePipe } from '@ngx-translate/core';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { collectionFilterNames } from '@osf/features/collections/constants';
import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { CollectionSubmissionWithGuid } from '@shared/models';

@Component({
  selector: 'osf-collections-search-result-card',
  imports: [DatePipe, TranslatePipe, ContributorsListComponent],
  templateUrl: './collections-search-result-card.component.html',
  styleUrl: './collections-search-result-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsSearchResultCardComponent {
  cardItem = input.required<CollectionSubmissionWithGuid>();

  presentSubmissionAttributes = computed(() => {
    const item = this.cardItem();
    if (!item) return [];

    return collectionFilterNames
      .map((attribute) => ({
        ...attribute,
        value: item[attribute.key as keyof CollectionSubmissionWithGuid] as string,
      }))
      .filter((attribute) => attribute.value);
  });
}
