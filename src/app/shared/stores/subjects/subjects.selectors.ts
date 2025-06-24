import { Selector } from '@ngxs/store';

import { SubjectsModel, SubjectsState } from '@shared/stores/subjects';

export class SubjectsSelectors {
  @Selector([SubjectsState])
  static getHighlightedSubjects(state: SubjectsModel) {
    return state.highlightedSubjects.data;
  }

  @Selector([SubjectsState])
  static getHighlightedSubjectsLoading(state: SubjectsModel): boolean {
    return state.highlightedSubjects.isLoading;
  }
}
