import { Action, State, StateContext } from '@ngxs/store';

import { catchError, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { handleSectionError } from '@core/handlers';
import { ForkService } from '@osf/shared/services';

import { ClearForks, GetAllForks } from './forks.actions';
import { FORKS_DEFAULTS, ForksStateModel } from './forks.model';

@State<ForksStateModel>({
  name: 'forks',
  defaults: FORKS_DEFAULTS,
})
@Injectable()
export class ForksState {
  forkService = inject(ForkService);

  @Action(GetAllForks)
  getForks(ctx: StateContext<ForksStateModel>, action: GetAllForks) {
    const state = ctx.getState();
    ctx.patchState({
      forks: {
        ...state.forks,
        isLoading: true,
      },
    });

    return this.forkService.fetchAllForks(action.resourceId, action.resourceType, action.page, action.pageSize).pipe(
      tap((response) => {
        ctx.patchState({
          forks: {
            data: response.data,
            isLoading: false,
            error: null,
          },
          totalCount: response.totalCount,
        });
      }),
      catchError((error) => handleSectionError(ctx, 'forks', error))
    );
  }

  @Action(ClearForks)
  clearForks(ctx: StateContext<ForksStateModel>) {
    ctx.patchState(FORKS_DEFAULTS);
  }
}
