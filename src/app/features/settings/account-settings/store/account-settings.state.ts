import { Action, State, StateContext, Store } from '@ngxs/store';

import { catchError, tap, throwError } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { SetCurrentUser, UserSelectors } from '@core/store/user';
import { handleSectionError } from '@osf/shared/helpers/state-error.handler';
import { InstitutionsService } from '@osf/shared/services/institutions.service';

import { AccountSettingsMapper } from '../mappers';
import { AccountSettingsService } from '../services';

import {
  CancelDeactivationRequest,
  DeactivateAccount,
  DeleteExternalIdentity,
  DeleteUserInstitution,
  DisableTwoFactorAuth,
  EnableTwoFactorAuth,
  GetAccountSettings,
  GetExternalIdentities,
  GetUserInstitutions,
  UpdateAccountSettings,
  UpdateIndexing,
  UpdatePassword,
  UpdateRegion,
  VerifyTwoFactorAuth,
} from './account-settings.actions';
import { ACCOUNT_SETTINGS_STATE_DEFAULTS, AccountSettingsStateModel } from './account-settings.model';

@Injectable()
@State<AccountSettingsStateModel>({
  name: 'accountSettings',
  defaults: ACCOUNT_SETTINGS_STATE_DEFAULTS,
})
export class AccountSettingsState {
  private readonly accountSettingsService = inject(AccountSettingsService);
  private readonly institutionsService = inject(InstitutionsService);
  private readonly store = inject(Store);

  @Action(UpdateRegion)
  updateRegion(ctx: StateContext<AccountSettingsStateModel>, action: UpdateRegion) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateLocation(currentUser.id, action.regionId).pipe(
      tap((user) => ctx.dispatch(new SetCurrentUser(user))),
      catchError((error) => throwError(() => error))
    );
  }

  @Action(UpdateIndexing)
  updateIndexing(ctx: StateContext<AccountSettingsStateModel>, action: UpdateIndexing) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateIndexing(currentUser.id, action.allowIndexing).pipe(
      tap((user) => ctx.dispatch(new SetCurrentUser(user))),
      catchError((error) => throwError(() => error))
    );
  }

  @Action(GetExternalIdentities)
  getExternalIdentities(ctx: StateContext<AccountSettingsStateModel>) {
    return this.accountSettingsService.getExternalIdentities().pipe(
      tap((identities) => ctx.patchState({ externalIdentities: identities })),
      catchError((error) => throwError(() => error))
    );
  }

  @Action(DeleteExternalIdentity)
  deleteExternalIdentity(ctx: StateContext<AccountSettingsStateModel>, action: DeleteExternalIdentity) {
    return this.accountSettingsService.deleteExternalIdentity(action.externalId).pipe(
      tap(() => ctx.dispatch(GetExternalIdentities)),
      catchError((error) => throwError(() => error))
    );
  }

  @Action(GetUserInstitutions)
  getUserInstitutions(ctx: StateContext<AccountSettingsStateModel>) {
    return this.institutionsService.getUserInstitutions().pipe(
      tap((userInstitutions) => ctx.patchState({ userInstitutions })),
      catchError((error) => throwError(() => error))
    );
  }

  @Action(DeleteUserInstitution)
  deleteUserInstitution(ctx: StateContext<AccountSettingsStateModel>, action: DeleteUserInstitution) {
    return this.institutionsService.deleteUserInstitution(action.id, action.userId).pipe(
      tap(() => ctx.dispatch(GetUserInstitutions)),
      catchError((error) => throwError(() => error))
    );
  }

  @Action(GetAccountSettings)
  getAccountSettings(ctx: StateContext<AccountSettingsStateModel>) {
    ctx.patchState({ accountSettings: { ...ctx.getState().accountSettings, isLoading: true } });

    return this.accountSettingsService.getSettings().pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(UpdateAccountSettings)
  updateAccountSettings(ctx: StateContext<AccountSettingsStateModel>, action: UpdateAccountSettings) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    ctx.patchState({ accountSettings: { ...ctx.getState().accountSettings, isLoading: true } });

    const payload = AccountSettingsMapper.getEmailSettingsRequest(action.accountSettings);

    return this.accountSettingsService.updateSettings(currentUser.id, payload).pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(DisableTwoFactorAuth)
  disableTwoFactorAuth(ctx: StateContext<AccountSettingsStateModel>) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateSettings(currentUser.id, { two_factor_enabled: 'false' }).pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(EnableTwoFactorAuth)
  enableTwoFactorAuth(ctx: StateContext<AccountSettingsStateModel>) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateSettings(currentUser.id, { two_factor_enabled: 'true' }).pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(VerifyTwoFactorAuth)
  verifyTwoFactorAuth(ctx: StateContext<AccountSettingsStateModel>, action: VerifyTwoFactorAuth) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateSettings(currentUser.id, { two_factor_verification: action.code }).pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(DeactivateAccount)
  deactivateAccount(ctx: StateContext<AccountSettingsStateModel>) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateSettings(currentUser.id, { deactivation_requested: 'true' }).pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(CancelDeactivationRequest)
  cancelDeactivationRequest(ctx: StateContext<AccountSettingsStateModel>) {
    const currentUser = this.store.selectSnapshot(UserSelectors.getCurrentUser);

    if (!currentUser?.id) {
      return;
    }

    return this.accountSettingsService.updateSettings(currentUser.id, { deactivation_requested: 'false' }).pipe(
      tap((settings) =>
        ctx.patchState({
          accountSettings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        })
      ),
      catchError((error) => handleSectionError(ctx, 'accountSettings', error))
    );
  }

  @Action(UpdatePassword)
  updatePassword(ctx: StateContext<AccountSettingsStateModel>, action: UpdatePassword) {
    return this.accountSettingsService
      .updatePassword(action.oldPassword, action.newPassword)
      .pipe(catchError((error) => throwError(() => error)));
  }
}
