import { Action, State, StateContext } from '@ngxs/store';

import { tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { UserService } from '@core/services/user/user.service';

import { GetCurrentUser, SetCurrentUser } from './user.actions';
import { UserStateModel } from './user.models';

@State<UserStateModel>({
  name: 'user',
  defaults: {
    currentUser: null,
  },
})
@Injectable()
export class UserState {
  private userService = inject(UserService);

  @Action(GetCurrentUser)
  getCurrentUser(ctx: StateContext<UserStateModel>) {
    return this.userService.getCurrentUser().pipe(
      tap((user) => {
        ctx.dispatch(new SetCurrentUser(user));
      }),
    );
  }

  @Action(SetCurrentUser)
  setCurrentUser(ctx: StateContext<UserStateModel>, action: SetCurrentUser) {
    ctx.patchState({
      currentUser: action.user,
    });
  }
}
