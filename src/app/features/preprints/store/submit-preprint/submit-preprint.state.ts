import { Action, State, StateContext } from '@ngxs/store';

import { EMPTY, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { PreprintFileSource } from '@osf/features/preprints/enums';
import { PreprintsService } from '@osf/features/preprints/services';

import {
  CreatePreprint,
  ResetStateAndDeletePreprint,
  SetSelectedPreprintFileSource,
  SetSelectedPreprintProviderId,
  SubmitPreprintStateModel,
  UpdatePreprint,
} from './';

@State<SubmitPreprintStateModel>({
  name: 'submitPreprint',
  defaults: {
    selectedProviderId: null,
    createdPreprint: null,
    fileSource: PreprintFileSource.None,
  },
})
@Injectable()
export class SubmitPreprintState {
  preprintsService = inject(PreprintsService);

  @Action(SetSelectedPreprintProviderId)
  setSelectedPreprintProviderId(ctx: StateContext<SubmitPreprintStateModel>, action: SetSelectedPreprintProviderId) {
    ctx.patchState({
      selectedProviderId: action.id,
    });
  }

  @Action(CreatePreprint)
  createPreprint(ctx: StateContext<SubmitPreprintStateModel>, action: CreatePreprint) {
    return this.preprintsService.createPreprint(action.title, action.abstract, action.providerId).pipe(
      tap((preprint) => {
        ctx.patchState({
          createdPreprint: preprint,
        });
      })
    );
  }

  @Action(UpdatePreprint)
  updatePreprint(ctx: StateContext<SubmitPreprintStateModel>, action: UpdatePreprint) {
    return this.preprintsService.updatePreprint(action.id, action.payload).pipe(
      tap((preprint) => {
        ctx.patchState({
          createdPreprint: preprint,
        });
      })
    );
  }

  @Action(ResetStateAndDeletePreprint)
  resetStateAndDeletePreprint(ctx: StateContext<SubmitPreprintStateModel>) {
    const state = ctx.getState();
    const createdPreprintId = state.createdPreprint?.id;
    ctx.setState({
      selectedProviderId: null,
      createdPreprint: null,
      fileSource: PreprintFileSource.None,
    });
    if (createdPreprintId) {
      return this.preprintsService.deletePreprint(createdPreprintId);
    }

    return EMPTY;
  }

  @Action(SetSelectedPreprintFileSource)
  setSelectedPreprintFileSource(ctx: StateContext<SubmitPreprintStateModel>, action: SetSelectedPreprintFileSource) {
    ctx.patchState({
      fileSource: action.fileSource,
    });
  }
}
