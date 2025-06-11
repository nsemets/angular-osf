import { Selector } from '@ngxs/store';

import { MetadataStateModel } from './project-metadata.model';
import { ProjectMetadataState } from './project-metadata.state';

export class ProjectMetadataSelectors {
  @Selector([ProjectMetadataState])
  static getCustomItemMetadata(state: MetadataStateModel) {
    return state.customItemMetadata;
  }

  @Selector([ProjectMetadataState])
  static getLoading(state: MetadataStateModel) {
    return state.loading;
  }

  @Selector([ProjectMetadataState])
  static getError(state: MetadataStateModel) {
    return state.error;
  }

  @Selector([ProjectMetadataState])
  static getFundersList(state: MetadataStateModel) {
    return state.fundersList;
  }

  @Selector([ProjectMetadataState])
  static getFundersLoading(state: MetadataStateModel) {
    return state.fundersLoading;
  }
}
