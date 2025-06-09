import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

import { SubHeaderComponent } from '@shared/components';

import { metadataTemplates } from '../../models';

@Component({
  selector: 'osf-add-metadata',
  imports: [SubHeaderComponent, Button],
  templateUrl: './add-metadata.component.html',
  styleUrl: './add-metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMetadataComponent {
  @HostBinding('class') classes = 'flex flex-1 flex-column w-full h-full';
  protected readonly metadataTemplates = metadataTemplates;
}
