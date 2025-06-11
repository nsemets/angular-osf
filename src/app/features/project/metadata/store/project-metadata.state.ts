import { Action, State, StateContext } from '@ngxs/store';

import { finalize, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { MetadataService } from '@osf/features/project/metadata/services/metadata.service';
import {
  GetCustomItemMetadata,
  GetFundersList,
  MetadataStateModel,
  ResetCustomItemMetadata,
  UpdateCustomItemMetadata,
} from '@osf/features/project/metadata/store';

@Injectable()
@State<MetadataStateModel>({
  name: 'metadata',
  defaults: {
    customItemMetadata: null,
    fundersList: [],
    loading: false,
    fundersLoading: false,
    error: null,
  },
})
export class ProjectMetadataState {
  private readonly metadataService = inject(MetadataService);

  @Action(GetCustomItemMetadata)
  getCustomItemMetadata(ctx: StateContext<MetadataStateModel>, action: GetCustomItemMetadata) {
    ctx.patchState({
      loading: true,
      error: null,
    });

    return this.metadataService.getCustomItemMetadata(action.guid).pipe(
      tap({
        next: (response) => {
          console.log('Custom metadata API response:', response);
          ctx.patchState({
            customItemMetadata: response.data.attributes,
            loading: false,
          });
        },
        error: (error) => {
          console.error('Custom metadata API error:', error);
          ctx.patchState({
            error: error.message || 'Failed to load metadata',
            loading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ loading: false }))
    );
  }

  @Action(UpdateCustomItemMetadata)
  updateCustomItemMetadata(ctx: StateContext<MetadataStateModel>, action: UpdateCustomItemMetadata) {
    ctx.patchState({
      loading: true,
      error: null,
    });

    return this.metadataService.updateCustomItemMetadata(action.guid, action.metadata).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            customItemMetadata: response.data.attributes,
            loading: false,
          });
        },
        error: (error) => {
          ctx.patchState({
            error: error.message || 'Failed to update metadata',
            loading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ loading: false }))
    );
  }

  @Action(GetFundersList)
  getFundersList(ctx: StateContext<MetadataStateModel>, action: GetFundersList) {
    ctx.patchState({
      fundersLoading: true,
      error: null,
    });

    return this.metadataService.getFundersList(action.search).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            fundersList: response.message.items,
            fundersLoading: false,
          });
        },
        error: (error) => {
          ctx.patchState({
            error: error.message,
            fundersLoading: false,
          });
        },
      }),
      finalize(() => ctx.patchState({ fundersLoading: false }))
    );
  }

  @Action(ResetCustomItemMetadata)
  resetCustomItemMetadata(ctx: StateContext<MetadataStateModel>) {
    ctx.setState({
      customItemMetadata: null,
      fundersList: [],
      loading: false,
      fundersLoading: false,
      error: null,
    });
  }
}
