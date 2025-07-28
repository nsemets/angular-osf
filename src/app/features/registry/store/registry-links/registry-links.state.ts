import { Action, State, StateContext } from '@ngxs/store';

import { catchError, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { handleSectionError } from '@core/handlers';

import { RegistryLinksService } from '../../services/registry-links.service';

import { GetLinkedNodes, GetLinkedRegistrations } from './registry-links.actions';
import { RegistryLinksStateModel } from './registry-links.model';

const initialState: RegistryLinksStateModel = {
  linkedNodes: { data: [], isLoading: false, error: null },
  linkedRegistrations: { data: [], isLoading: false, error: null },
};

@State<RegistryLinksStateModel>({
  name: 'registryLinks',
  defaults: initialState,
})
@Injectable()
export class RegistryLinksState {
  private readonly registryLinksService = inject(RegistryLinksService);

  @Action(GetLinkedNodes)
  getLinkedNodes(ctx: StateContext<RegistryLinksStateModel>, action: GetLinkedNodes) {
    ctx.patchState({
      linkedNodes: {
        ...ctx.getState().linkedNodes,
        isLoading: true,
        error: null,
      },
    });

    return this.registryLinksService.getLinkedNodes(action.registryId, action.page, action.pageSize).pipe(
      tap((response) => {
        ctx.patchState({
          linkedNodes: {
            data: response.data,
            isLoading: false,
            error: null,
            meta: response.meta,
            links: response.links,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'linkedNodes', error))
    );
  }

  @Action(GetLinkedRegistrations)
  getLinkedRegistrations(ctx: StateContext<RegistryLinksStateModel>, action: GetLinkedRegistrations) {
    ctx.patchState({
      linkedRegistrations: {
        ...ctx.getState().linkedRegistrations,
        isLoading: true,
        error: null,
      },
    });

    return this.registryLinksService.getLinkedRegistrations(action.registryId, action.page, action.pageSize).pipe(
      tap((response) => {
        ctx.patchState({
          linkedRegistrations: {
            data: response.data,
            isLoading: false,
            error: null,
            meta: response.meta,
            links: response.links,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'linkedRegistrations', error))
    );
  }
}
