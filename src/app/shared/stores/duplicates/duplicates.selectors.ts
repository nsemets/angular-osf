import { Selector } from '@ngxs/store';

import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';

import { DuplicatesStateModel } from './duplicates.model';
import { DuplicatesState } from './duplicates.state';

export class DuplicatesSelectors {
  @Selector([DuplicatesState])
  static getDuplicates(state: DuplicatesStateModel) {
    return state.duplicates.data.map((node) => ({
      ...node,
      canShowForkMenu:
        node.currentUserPermissions.includes(UserPermissions.Admin) ||
        node.currentUserPermissions.includes(UserPermissions.Write),
    }));
  }

  @Selector([DuplicatesState])
  static getDuplicatesLoading(state: DuplicatesStateModel) {
    return state.duplicates.isLoading;
  }

  @Selector([DuplicatesState])
  static getDuplicatesTotalCount(state: DuplicatesStateModel) {
    return state.duplicates.totalCount;
  }
}
