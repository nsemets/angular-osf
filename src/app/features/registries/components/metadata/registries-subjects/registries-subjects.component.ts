import { createDispatchMap, select } from '@ngxs/store';

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  FetchRegistrationSubjects,
  RegistriesSelectors,
  UpdateRegistrationSubjects,
} from '@osf/features/registries/store';
import { SubjectsComponent } from '@osf/shared/components';
import { Subject } from '@osf/shared/models';
import { FetchChildrenSubjects, FetchSubjects } from '@osf/shared/stores';
import { SubjectsSelectors } from '@osf/shared/stores/subjects/subjects.selectors';

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

  protected subjects = select(SubjectsSelectors.getSubjects);
  protected subjectsLoading = select(SubjectsSelectors.getSubjectsLoading);
  protected searchedSubjects = select(SubjectsSelectors.getSearchedSubjects);
  protected isSearching = select(SubjectsSelectors.getSearchedSubjectsLoading);
  protected selectedSubjects = select(RegistriesSelectors.getSelectedSubjects);
  protected isSubjectsUpdating = select(RegistriesSelectors.isSubjectsUpdating);

  protected actions = createDispatchMap({
    fetchSubjects: FetchSubjects,
    fetchRegistrationSubjects: FetchRegistrationSubjects,
    fetchChildrenSubjects: FetchChildrenSubjects,
    updateRegistrationSubjects: UpdateRegistrationSubjects,
  });

  constructor() {
    this.actions.fetchSubjects();
    this.actions.fetchRegistrationSubjects(this.draftId);
  }

  getSubjectChildren(parentId: string) {
    this.actions.fetchChildrenSubjects(parentId);
  }

  searchSubjects(search: string) {
    this.actions.fetchSubjects(search);
  }

  updateSelectedSubjects(subjects: Subject[]) {
    this.updateControlState(subjects);
    this.actions.updateRegistrationSubjects(this.draftId, subjects);
  }

  onFocusOut() {
    if (this.control()) {
      this.control().markAsTouched();
      this.control().markAsDirty();
      this.control().updateValueAndValidity();
    }
  }

  updateControlState(value: Subject[]) {
    if (this.control()) {
      this.control().setValue(value);
      this.control().markAsTouched();
      this.control().markAsDirty();
      this.control().updateValueAndValidity();
    }
  }
}
