import { Action, State, StateContext } from '@ngxs/store';

import { catchError, tap, throwError } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { ModerationService } from '../services';

import { LoadCollectionModerators } from './moderation.actions';
import { ModerationStateModel } from './moderation.model';

@State<ModerationStateModel>({
  name: 'moderation',
  defaults: {
    collectionModerators: {
      data: [],
      isLoading: false,
      error: null,
      searchValue: null,
    },
  },
})
@Injectable()
export class ModerationState {
  private readonly moderationService = inject(ModerationService);

  @Action(LoadCollectionModerators)
  loadCollectionModerators(ctx: StateContext<ModerationStateModel>, action: LoadCollectionModerators) {
    const state = ctx.getState();

    ctx.patchState({
      collectionModerators: {
        ...state.collectionModerators,
        isLoading: true,
      },
    });

    return this.moderationService.getCollectionModerators(action.providerId).pipe(
      tap((moderators) => {
        const state = ctx.getState();

        ctx.patchState({
          collectionModerators: {
            ...state.collectionModerators,
            data: moderators,
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'collectionModerators', error))
    );
  }

  private handleError(ctx: StateContext<ModerationStateModel>, section: keyof ModerationStateModel, error: Error) {
    ctx.patchState({
      [section]: {
        ...ctx.getState()[section],
        isLoading: false,
        error: error.message,
      },
    });
    return throwError(() => error);
  }
}
