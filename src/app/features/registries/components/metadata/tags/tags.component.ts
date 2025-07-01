import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TagsInputComponent } from '@osf/shared/components';

@Component({
  selector: 'osf-registries-metadata-tags',
  imports: [Card, TagsInputComponent, TranslatePipe],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistriesMetadataTagsComponent {
  onTagsChanged(tags: string[]): void {
    console.log('Tags changed:', tags);
  }
}
