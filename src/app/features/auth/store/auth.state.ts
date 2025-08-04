import { Action, State, StateContext } from '@ngxs/store';

import { inject, Injectable } from '@angular/core';

import { AuthService } from '@osf/features/auth/services';

import { RegisterUser } from './auth.actions';
import { AuthStateModel } from './auth.model';

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    accessToken: null,
    isAuthenticated: false,
  },
})
@Injectable()
export class AuthState {
  private readonly authService = inject(AuthService);

  @Action(RegisterUser)
  signUp(ctx: StateContext<AuthStateModel>, action: RegisterUser) {
    return this.authService.register(action.payload).subscribe();
  }
}
