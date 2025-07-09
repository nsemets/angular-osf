import { Selector } from '@ngxs/store';

import { ModeratorAddModel } from '../models';

import { ModerationStateModel } from './moderation.model';
import { ModerationState } from './moderation.state';

export class ModerationSelectors {
  @Selector([ModerationState])
  static getModerators(state: ModerationStateModel) {
    return state.moderators.data.filter((moderator) => {
      return state.moderators.searchValue
        ? moderator.fullName.toLowerCase().includes(state.moderators.searchValue.toLowerCase())
        : true;
    });
  }

  @Selector([ModerationState])
  static isModeratorsLoading(state: ModerationStateModel) {
    return state.moderators.isLoading || false;
  }

  @Selector([ModerationState])
  static isModeratorsError(state: ModerationStateModel) {
    return !!state.moderators.error?.length;
  }

  @Selector([ModerationState])
  static getUsers(state: ModerationStateModel): ModeratorAddModel[] {
    return state.users.data;
  }

  @Selector([ModerationState])
  static isUsersLoading(state: ModerationStateModel): boolean {
    return state.users.isLoading;
  }

  @Selector([ModerationState])
  static getUsersError(state: ModerationStateModel): string | null {
    return state.users.error;
  }

  @Selector([ModerationState])
  static getUsersTotalCount(state: ModerationStateModel): number {
    return state.users.totalCount;
  }
}
