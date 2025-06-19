import { Selector } from '@ngxs/store';

import { SubmitPreprintState, SubmitPreprintStateModel } from '@osf/features/preprints/store/submit-preprint';

export class SubmitPreprintSelectors {
  @Selector([SubmitPreprintState])
  static getSelectedProviderId(state: SubmitPreprintStateModel) {
    return state.selectedProviderId;
  }

  @Selector([SubmitPreprintState])
  static getCreatedPreprint(state: SubmitPreprintStateModel) {
    return state.createdPreprint;
  }

  @Selector([SubmitPreprintState])
  static getSelectedFileSource(state: SubmitPreprintStateModel) {
    return state.fileSource;
  }
}
