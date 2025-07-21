import { Action, State, StateContext } from '@ngxs/store';

import { finalize, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { RegistryMetadataMapper } from '../../mappers';
import { RegistryMetadataService } from '../../services/registry-metadata.service';

import {
  GetBibliographicContributors,
  GetCustomItemMetadata,
  GetFundersList,
  GetRegistryForMetadata,
  GetRegistrySubjects,
  GetUserInstitutions,
  UpdateCustomItemMetadata,
  UpdateRegistryDetails,
} from './registry-metadata.actions';
import { RegistryMetadataStateModel } from './registry-metadata.model';

const initialState: RegistryMetadataStateModel = {
  registry: { data: null, isLoading: false, error: null },
  bibliographicContributors: { data: [], isLoading: false, error: null },
  customItemMetadata: { data: null, isLoading: false, error: null },
  fundersList: { data: [], isLoading: false, error: null },
  userInstitutions: { data: [], isLoading: false, error: null },
  subjects: { data: [], isLoading: false, error: null },
};

@State<RegistryMetadataStateModel>({
  name: 'registryMetadata',
  defaults: initialState,
})
@Injectable()
export class RegistryMetadataState {
  private readonly registryMetadataService = inject(RegistryMetadataService);

  @Action(GetRegistryForMetadata)
  getRegistryForMetadata(ctx: StateContext<RegistryMetadataStateModel>, action: GetRegistryForMetadata) {
    ctx.patchState({
      registry: {
        data: null,
        isLoading: true,
        error: null,
      },
    });

    return this.registryMetadataService.getRegistryForMetadata(action.registryId).pipe(
      tap({
        next: (registry) => {
          ctx.patchState({
            registry: {
              data: registry,
              isLoading: false,
              error: null,
            },
          });
        },
        error: (error) => {
          ctx.patchState({
            registry: {
              data: ctx.getState().registry.data,
              error: error.message,
              isLoading: false,
            },
          });
        },
      }),
      finalize(() =>
        ctx.patchState({
          registry: {
            data: ctx.getState().registry.data,
            error: null,
            isLoading: false,
          },
        })
      )
    );
  }

  @Action(GetBibliographicContributors)
  getBibliographicContributors(ctx: StateContext<RegistryMetadataStateModel>, action: GetBibliographicContributors) {
    ctx.patchState({
      bibliographicContributors: {
        data: [],
        isLoading: true,
        error: null,
      },
    });

    return this.registryMetadataService
      .getBibliographicContributors(action.registryId, action.page, action.pageSize)
      .pipe(
        tap({
          next: (response) => {
            const contributors = RegistryMetadataMapper.mapBibliographicContributors(response);
            ctx.patchState({
              bibliographicContributors: {
                data: contributors,
                isLoading: false,
                error: null,
              },
            });
          },
          error: (error) => {
            ctx.patchState({
              bibliographicContributors: {
                data: [],
                isLoading: false,
                error: error.message,
              },
            });
          },
        }),
        finalize(() =>
          ctx.patchState({
            bibliographicContributors: {
              ...ctx.getState().bibliographicContributors,
              isLoading: false,
            },
          })
        )
      );
  }

  @Action(GetRegistrySubjects)
  getRegistrySubjects(ctx: StateContext<RegistryMetadataStateModel>, action: GetRegistrySubjects) {
    ctx.patchState({
      subjects: {
        data: [],
        isLoading: true,
        error: null,
      },
    });

    return this.registryMetadataService.getRegistrySubjects(action.registryId, action.page, action.pageSize).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            subjects: {
              data: response.data,
              isLoading: false,
              error: null,
            },
          });
        },
        error: (error) => {
          ctx.patchState({
            subjects: {
              data: [],
              isLoading: false,
              error: error.message,
            },
          });
        },
      }),
      finalize(() =>
        ctx.patchState({
          subjects: {
            ...ctx.getState().subjects,
            isLoading: false,
          },
        })
      )
    );
  }

  @Action(GetCustomItemMetadata)
  getCustomItemMetadata(ctx: StateContext<RegistryMetadataStateModel>, action: GetCustomItemMetadata) {
    ctx.patchState({
      customItemMetadata: { data: null, isLoading: true, error: null },
    });

    return this.registryMetadataService.getCustomItemMetadata(action.guid).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            customItemMetadata: { data: response.data.attributes, isLoading: false, error: null },
          });
        },
        error: (error) => {
          ctx.patchState({
            customItemMetadata: { data: null, isLoading: false, error: error.message },
          });
        },
      }),
      finalize(() =>
        ctx.patchState({
          customItemMetadata: {
            ...ctx.getState().customItemMetadata,
            isLoading: false,
          },
        })
      )
    );
  }

  @Action(UpdateCustomItemMetadata)
  updateCustomItemMetadata(ctx: StateContext<RegistryMetadataStateModel>, action: UpdateCustomItemMetadata) {
    ctx.patchState({
      customItemMetadata: { data: null, isLoading: true, error: null },
    });

    return this.registryMetadataService.updateCustomItemMetadata(action.guid, action.metadata).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            customItemMetadata: { data: response.data.attributes, isLoading: false, error: null },
          });
        },
        error: (error) => {
          ctx.patchState({
            customItemMetadata: { ...ctx.getState().customItemMetadata, isLoading: false, error: error.message },
          });
        },
      }),
      finalize(() => ctx.patchState({ customItemMetadata: { ...ctx.getState().customItemMetadata, isLoading: false } }))
    );
  }

  @Action(UpdateRegistryDetails)
  updateRegistryDetails(ctx: StateContext<RegistryMetadataStateModel>, action: UpdateRegistryDetails) {
    ctx.patchState({
      registry: {
        ...ctx.getState().registry,
        isLoading: true,
        error: null,
      },
    });

    return this.registryMetadataService.updateRegistryDetails(action.registryId, action.updates).pipe(
      tap({
        next: (updatedRegistry) => {
          const currentRegistry = ctx.getState().registry.data;

          ctx.patchState({
            registry: {
              data: {
                ...currentRegistry,
                ...updatedRegistry,
              },
              error: null,
              isLoading: false,
            },
          });
        },
        error: (error) => {
          ctx.patchState({
            registry: {
              ...ctx.getState().registry,
              error: error.message,
              isLoading: false,
            },
          });
        },
      }),
      finalize(() =>
        ctx.patchState({
          registry: {
            ...ctx.getState().registry,
            error: null,
            isLoading: false,
          },
        })
      )
    );
  }

  @Action(GetFundersList)
  getFundersList(ctx: StateContext<RegistryMetadataStateModel>, action: GetFundersList) {
    ctx.patchState({
      fundersList: { data: [], isLoading: true, error: null },
    });

    return this.registryMetadataService.getFundersList(action.search).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            fundersList: { data: response.message.items, isLoading: false, error: null },
          });
        },
        error: (error) => {
          ctx.patchState({
            fundersList: {
              ...ctx.getState().fundersList,
              isLoading: false,
              error: error.message,
            },
          });
        },
      }),
      finalize(() =>
        ctx.patchState({
          fundersList: {
            ...ctx.getState().fundersList,
            isLoading: false,
          },
        })
      )
    );
  }

  @Action(GetUserInstitutions)
  getUserInstitutions(ctx: StateContext<RegistryMetadataStateModel>, action: GetUserInstitutions) {
    ctx.patchState({
      userInstitutions: {
        data: [],
        isLoading: true,
        error: null,
      },
    });

    return this.registryMetadataService.getUserInstitutions(action.userId, action.page, action.pageSize).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            userInstitutions: {
              data: response.data,
              isLoading: false,
              error: null,
            },
          });
        },
        error: (error) => {
          ctx.patchState({
            userInstitutions: {
              ...ctx.getState().userInstitutions,
              error: error.message,
              isLoading: false,
            },
          });
        },
      }),
      finalize(() =>
        ctx.patchState({
          userInstitutions: {
            ...ctx.getState().userInstitutions,
            error: null,
            isLoading: false,
          },
        })
      )
    );
  }
}
