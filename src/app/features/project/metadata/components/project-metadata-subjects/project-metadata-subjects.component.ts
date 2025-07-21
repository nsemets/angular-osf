import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { SubjectModel } from '@osf/shared/models';
import { SubjectsComponent } from '@shared/components';

@Component({
  selector: 'osf-project-metadata-subjects',
  imports: [SubjectsComponent, Card],
  templateUrl: './project-metadata-subjects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProjectMetadataSubjectsComponent {
  selectedSubjects = input.required<SubjectModel[]>();
  isSubjectsUpdating = input.required<boolean>();

  getSubjectChildren = output<string>();
  searchSubjects = output<string>();
  updateSelectedSubjects = output<SubjectModel[]>();
}
