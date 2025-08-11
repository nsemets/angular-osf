import { Selector } from '@ngxs/store';

import { ForksStateModel } from './forks.model';
import { ForksState } from './forks.state';

export class ForksSelectors {
  @Selector([ForksState])
  static getForks(state: ForksStateModel) {
    return state.forks.data;
  }

  @Selector([ForksState])
  static getForksLoading(state: ForksStateModel) {
    return state.forks.isLoading;
  }

  @Selector([ForksState])
  static getForksTotalCount(state: ForksStateModel) {
    return state.totalCount;
  }
}
