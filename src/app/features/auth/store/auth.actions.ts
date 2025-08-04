import { SignUpModel } from '@osf/features/auth/models';

export class RegisterUser {
  static readonly type = '[Auth] Register User';

  constructor(public payload: SignUpModel) {}
}
