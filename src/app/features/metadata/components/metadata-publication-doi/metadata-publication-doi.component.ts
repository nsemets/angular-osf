import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { IdentifierModel } from '@osf/shared/models/identifiers/identifier.model';

@Component({
  selector: 'osf-metadata-publication-doi',
  imports: [Button, Card, TranslatePipe],
  templateUrl: './metadata-publication-doi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataPublicationDoiComponent {
  openEditPublicationDoiDialog = output<void>();

  identifiers = input<IdentifierModel[]>([]);
  hideEditDoi = input<boolean>(false);
  publicationDoi = input<string | null>(null);
  resourceType = input<ResourceType>(ResourceType.Project);
  doiHost = 'https://doi.org/';

  isProject = computed(() => this.resourceType() === ResourceType.Project);
}
