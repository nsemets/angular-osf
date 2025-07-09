import { Action, State, StateContext } from '@ngxs/store';

import { catchError, of, tap, throwError } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { ModeratorModel } from '../models';
import { ModerationService } from '../services';

import {
  AddModerator,
  ClearUsers,
  DeleteModerator,
  LoadModerators,
  SearchUsers,
  UpdateModerator,
  UpdateSearchValue,
} from './moderation.actions';
import { ModerationStateModel } from './moderation.model';

@State<ModerationStateModel>({
  name: 'moderation',
  defaults: {
    moderators: {
      data: [],
      isLoading: false,
      error: null,
      searchValue: null,
    },
    users: {
      data: [],
      isLoading: false,
      error: null,
      totalCount: 0,
    },
  },
})
@Injectable()
export class ModerationState {
  private readonly moderationService = inject(ModerationService);

  @Action(LoadModerators)
  loadModerators(ctx: StateContext<ModerationStateModel>, action: LoadModerators) {
    const state = ctx.getState();

    if (!action.resourceType) {
      return;
    }

    ctx.patchState({
      moderators: { ...state.moderators, isLoading: true, error: null },
    });

    return this.moderationService.getModerators(action.resourceId, action.resourceType).pipe(
      tap((moderators: ModeratorModel[]) => {
        ctx.patchState({
          moderators: {
            ...state.moderators,
            data: moderators,
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'moderators', error))
    );
  }

  @Action(UpdateSearchValue)
  updateSearchValue(ctx: StateContext<ModerationStateModel>, action: UpdateSearchValue) {
    ctx.patchState({
      moderators: { ...ctx.getState().moderators, searchValue: action.searchValue },
    });
  }

  @Action(AddModerator)
  addModerator(ctx: StateContext<ModerationStateModel>, action: AddModerator) {
    const state = ctx.getState();

    if (!action.resourceType) {
      return;
    }

    ctx.patchState({
      moderators: { ...state.moderators, isLoading: true, error: null },
    });

    return this.moderationService.addModerator(action.resourceId, action.resourceType, action.moderator).pipe(
      tap((moderator) => {
        const currentState = ctx.getState();

        ctx.patchState({
          moderators: {
            ...currentState.moderators,
            data: [...currentState.moderators.data, moderator],
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'moderators', error))
    );
  }

  @Action(UpdateModerator)
  updateCollectionModerator(ctx: StateContext<ModerationStateModel>, action: UpdateModerator) {
    const state = ctx.getState();

    if (!action.resourceType) {
      return;
    }

    ctx.patchState({
      moderators: { ...state.moderators, isLoading: true, error: null },
    });

    return this.moderationService.updateModerator(action.resourceId, action.resourceType, action.moderator).pipe(
      tap((updatedModerator) => {
        const currentState = ctx.getState();

        ctx.patchState({
          moderators: {
            ...currentState.moderators,
            data: currentState.moderators.data.map((moderator) =>
              moderator.id === updatedModerator.id ? updatedModerator : moderator
            ),
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'moderators', error))
    );
  }

  @Action(DeleteModerator)
  deleteCollectionModerator(ctx: StateContext<ModerationStateModel>, action: DeleteModerator) {
    const state = ctx.getState();

    if (!action.resourceType) {
      return;
    }

    ctx.patchState({
      moderators: { ...state.moderators, isLoading: true, error: null },
    });

    return this.moderationService.deleteModerator(action.resourceId, action.resourceType, action.moderatorId).pipe(
      tap(() => {
        ctx.patchState({
          moderators: {
            ...state.moderators,
            data: state.moderators.data.filter((moderator) => moderator.userId !== action.moderatorId),
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'moderators', error))
    );
  }

  @Action(SearchUsers)
  searchUsers(ctx: StateContext<ModerationStateModel>, action: SearchUsers) {
    const state = ctx.getState();

    ctx.patchState({
      users: { ...state.users, isLoading: true, error: null },
    });

    const addedModeratorsIds = state.moderators.data.map((moderator) => moderator.userId);

    if (!action.searchValue) {
      return of([]);
    }

    return this.moderationService.searchUsers(action.searchValue, action.page).pipe(
      tap((users) => {
        ctx.patchState({
          users: {
            data: users.data.filter((user) => !addedModeratorsIds.includes(user.id!)),
            isLoading: false,
            error: '',
            totalCount: users.totalCount,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'users', error))
    );
  }

  @Action(ClearUsers)
  clearUsers(ctx: StateContext<ModerationStateModel>) {
    ctx.patchState({ users: { data: [], isLoading: false, error: null, totalCount: 0 } });
  }

  private handleError(ctx: StateContext<ModerationStateModel>, key: keyof ModerationStateModel, error: Error) {
    const state = ctx.getState();
    ctx.patchState({
      [key]: {
        ...state[key],
        isLoading: false,
        error: error.message,
      },
    });
    return throwError(() => error);
  }
}
