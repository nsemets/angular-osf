import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ProjectOverview } from '@osf/features/project/overview/models';

@Component({
  selector: 'osf-project-metadata-resource-information',
  imports: [Button, Card, TranslatePipe],
  templateUrl: './project-metadata-resource-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProjectMetadataResourceInformationComponent {
  openEditResourceInformationDialog = output<void>();

  currentProject = input.required<ProjectOverview | null>();
}
