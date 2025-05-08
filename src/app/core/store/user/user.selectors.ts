import { Selector } from '@ngxs/store';

import { User } from '@core/services/user/user.entity';
import { UserStateModel } from '@core/store/user/user.models';
import { UserState } from '@core/store/user/user.state';

export class UserSelectors {
  @Selector([UserState])
  static getCurrentUser(state: UserStateModel): User | null {
    return state.currentUser;
  }
}
