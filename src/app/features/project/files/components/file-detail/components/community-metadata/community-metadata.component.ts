import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SubHeaderComponent } from '@shared/components';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { OsfMetadataTemplate } from '@osf/features/project/files/models/osf-models/metadata-template.model';

@Component({
  selector: 'osf-community-metadata',
  imports: [
    SubHeaderComponent,
    Card,
    Button
  ],
  templateUrl: './community-metadata.component.html',
  styleUrl: './community-metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommunityMetadataComponent {
  templates = signal<OsfMetadataTemplate[]>([
    {
      id: '2352',
      title: 'OSF Enhanced Metadata',
      description: 'Additional metadata for OSF records, derived from the DataCite 4.4 Schema'
    },
    {
      id: '2352',
      title: 'metaBUS',
      description: 'A metadata template for applied psychology and organizational research'
    },
    {
      id: '2352',
      title: 'Human Cognitive Neuroscience Data',
      description: 'This is a template to describe human cognitive neuroscience data.'
    },
    {
      id: '2352',
      title: 'Psych-DS Official Template',
      description: 'A community standard providing a systematic way of formatting and documenting datasets'
    },
    {
      id: '2352',
      title: 'LDbase Project Metadata Form ver. 2',
      description: 'The LDbase template is for projects in the fields of education, learning, and human development.'
    },
  ]);

}
