import { createDispatchMap, select } from '@ngxs/store';

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SubjectsComponent } from '@osf/shared/components';
import { ResourceType } from '@osf/shared/enums';
import { SubjectModel } from '@osf/shared/models';
import {
  FetchChildrenSubjects,
  FetchSelectedSubjects,
  FetchSubjects,
  SubjectsSelectors,
  UpdateResourceSubjects,
} from '@osf/shared/stores';

@Component({
  selector: 'osf-registries-subjects',
  imports: [SubjectsComponent],
  templateUrl: './registries-subjects.component.html',
  styleUrl: './registries-subjects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistriesSubjectsComponent {
  control = input.required<FormControl>();
  private readonly route = inject(ActivatedRoute);
  private readonly draftId = this.route.snapshot.params['id'];
  private readonly OSF_PROVIDER_ID = 'osf';

  protected selectedSubjects = select(SubjectsSelectors.getSelectedSubjects);
  protected isSubjectsUpdating = select(SubjectsSelectors.areSelectedSubjectsLoading);

  protected actions = createDispatchMap({
    fetchSubjects: FetchSubjects,
    fetchSelectedSubjects: FetchSelectedSubjects,
    fetchChildrenSubjects: FetchChildrenSubjects,
    updateResourceSubjects: UpdateResourceSubjects,
  });

  constructor() {
    this.actions.fetchSubjects(ResourceType.Registration, this.OSF_PROVIDER_ID);
    this.actions.fetchSelectedSubjects(this.draftId, ResourceType.DraftRegistration);
  }

  getSubjectChildren(parentId: string) {
    this.actions.fetchChildrenSubjects(parentId);
  }

  searchSubjects(search: string) {
    this.actions.fetchSubjects(ResourceType.Registration, this.OSF_PROVIDER_ID, search);
  }

  updateSelectedSubjects(subjects: SubjectModel[]) {
    this.updateControlState(subjects);
    this.actions.updateResourceSubjects(this.draftId, ResourceType.DraftRegistration, subjects);
  }

  onFocusOut() {
    if (this.control()) {
      this.control().markAsTouched();
      this.control().markAsDirty();
      this.control().updateValueAndValidity();
    }
  }

  updateControlState(value: SubjectModel[]) {
    if (this.control()) {
      this.control().setValue(value);
      this.control().markAsTouched();
      this.control().markAsDirty();
      this.control().updateValueAndValidity();
    }
  }
}
