import { Action, State, StateContext } from '@ngxs/store';

import { tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { SetCurrentProvider } from '@core/store/provider';
import { CurrentResourceType } from '@osf/shared/enums/resource-type.enum';
import { handleSectionError } from '@osf/shared/helpers/state-error.handler';

import { RegistryOverviewService } from '../../services';

import {
  ClearRegistryOverview,
  CreateSchemaResponse,
  GetRegistryById,
  GetRegistryIdentifiers,
  GetRegistryInstitutions,
  GetRegistryLicense,
  GetRegistryReviewActions,
  GetRegistrySchemaResponses,
  GetSchemaBlocks,
  MakePublic,
  SetRegistryCustomCitation,
  SubmitDecision,
  WithdrawRegistration,
} from './registry-overview.actions';
import { REGISTRY_OVERVIEW_DEFAULTS, RegistryOverviewStateModel } from './registry-overview.model';

@Injectable()
@State<RegistryOverviewStateModel>({
  name: 'registryOverview',
  defaults: REGISTRY_OVERVIEW_DEFAULTS,
})
export class RegistryOverviewState {
  private readonly registryOverviewService = inject(RegistryOverviewService);

  @Action(GetRegistryById)
  getRegistryById(ctx: StateContext<RegistryOverviewStateModel>, action: GetRegistryById) {
    const state = ctx.getState();

    if (state.registry.isLoading) {
      return;
    }

    ctx.patchState({
      registry: {
        ...state.registry,
        isLoading: true,
      },
    });

    return this.registryOverviewService.getRegistrationById(action.id).pipe(
      tap((response) => {
        const registryOverview = response.registry;

        if (registryOverview?.provider) {
          ctx.dispatch(
            new SetCurrentProvider({
              id: registryOverview.provider.id,
              name: registryOverview.provider.name,
              type: CurrentResourceType.Registrations,
              permissions: registryOverview.provider.permissions,
            })
          );
        }

        ctx.patchState({
          registry: {
            data: registryOverview,
            isLoading: false,
            error: null,
          },
          isAnonymous: response.meta?.anonymous ?? false,
        });
      }),
      catchError((error) => handleSectionError(ctx, 'registry', error))
    );
  }

  @Action(GetRegistryInstitutions)
  getRegistryInstitutions(ctx: StateContext<RegistryOverviewStateModel>, action: GetRegistryInstitutions) {
    const state = ctx.getState();
    ctx.patchState({
      institutions: {
        ...state.institutions,
        isLoading: true,
      },
    });

    return this.registryOverviewService.getInstitutions(action.registryId).pipe(
      tap((institutions) => {
        ctx.patchState({
          institutions: {
            data: institutions,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'institutions', error))
    );
  }

  @Action(GetRegistryIdentifiers)
  getRegistryIdentifiers(ctx: StateContext<RegistryOverviewStateModel>, action: GetRegistryIdentifiers) {
    const state = ctx.getState();
    ctx.patchState({
      identifiers: {
        ...state.identifiers,
        isLoading: true,
      },
    });

    return this.registryOverviewService.getRegistryIdentifiers(action.registryId).pipe(
      tap((identifiers) => {
        ctx.patchState({
          identifiers: {
            data: identifiers,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'identifiers', error))
    );
  }

  @Action(GetRegistryLicense)
  getRegistryLicense(ctx: StateContext<RegistryOverviewStateModel>, action: GetRegistryLicense) {
    const state = ctx.getState();
    ctx.patchState({
      license: {
        ...state.license,
        isLoading: true,
      },
    });

    return this.registryOverviewService.getRegistryLicense(action.licenseId).pipe(
      tap((license) => {
        ctx.patchState({
          license: {
            data: license,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'license', error))
    );
  }

  @Action(GetSchemaBlocks)
  getSchemaBlocks(ctx: StateContext<RegistryOverviewStateModel>, action: GetSchemaBlocks) {
    const state = ctx.getState();
    ctx.patchState({
      schemaBlocks: {
        ...state.schemaBlocks,
        isLoading: true,
      },
    });

    return this.registryOverviewService.getSchemaBlocks(action.schemaLink).pipe(
      tap((schemaBlocks) => {
        ctx.patchState({
          schemaBlocks: {
            data: schemaBlocks,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'schemaBlocks', error))
    );
  }

  @Action(GetRegistrySchemaResponses)
  getSchemaResponses(ctx: StateContext<RegistryOverviewStateModel>, action: GetRegistrySchemaResponses) {
    const state = ctx.getState();
    ctx.patchState({
      schemaResponses: {
        ...state.schemaResponses,
        isLoading: true,
      },
    });

    return this.registryOverviewService.getSchemaResponses(action.registryId).pipe(
      tap((schemaResponses) => {
        ctx.patchState({
          schemaResponses: {
            data: schemaResponses,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'schemaResponses', error))
    );
  }

  @Action(CreateSchemaResponse)
  createSchemaResponse(ctx: StateContext<RegistryOverviewStateModel>, { registryId }: CreateSchemaResponse) {
    const state = ctx.getState();

    ctx.patchState({
      currentSchemaResponse: {
        ...state.currentSchemaResponse,
        isLoading: true,
        error: null,
      },
    });

    return this.registryOverviewService.createSchemaResponse(registryId).pipe(
      tap((schemaResponse) => {
        ctx.patchState({
          currentSchemaResponse: {
            data: schemaResponse,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'currentSchemaResponse', error))
    );
  }

  @Action(WithdrawRegistration)
  withdrawRegistration(ctx: StateContext<RegistryOverviewStateModel>, action: WithdrawRegistration) {
    const state = ctx.getState();
    ctx.patchState({
      registry: {
        ...state.registry,
        isLoading: true,
      },
    });

    return this.registryOverviewService.withdrawRegistration(action.registryId, action.justification).pipe(
      tap((registryOverview) => {
        ctx.patchState({
          registry: {
            data: registryOverview,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'registry', error))
    );
  }

  @Action(MakePublic)
  makePublic(ctx: StateContext<RegistryOverviewStateModel>, action: MakePublic) {
    const state = ctx.getState();
    ctx.patchState({
      registry: {
        ...state.registry,
        isLoading: true,
      },
    });

    return this.registryOverviewService.makePublic(action.registryId).pipe(
      tap((registryOverview) => {
        ctx.patchState({
          registry: {
            data: registryOverview,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'registry', error))
    );
  }

  @Action(SetRegistryCustomCitation)
  setRegistryCustomCitation(ctx: StateContext<RegistryOverviewStateModel>, action: SetRegistryCustomCitation) {
    const state = ctx.getState();
    ctx.patchState({
      registry: {
        ...state.registry,
        data: {
          ...state.registry.data!,
          customCitation: action.citation,
        },
      },
    });
  }

  @Action(GetRegistryReviewActions)
  getRegistryReviewActions(ctx: StateContext<RegistryOverviewStateModel>, action: GetRegistryReviewActions) {
    ctx.patchState({
      moderationActions: {
        data: [],
        isLoading: true,
        isSubmitting: false,
        error: null,
      },
    });

    return this.registryOverviewService.getRegistryReviewActions(action.registryId).pipe(
      tap((reviewActions) => {
        ctx.patchState({
          moderationActions: {
            data: reviewActions,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'moderationActions', error))
    );
  }

  @Action(SubmitDecision)
  submitDecision(ctx: StateContext<RegistryOverviewStateModel>, action: SubmitDecision) {
    ctx.patchState({
      moderationActions: {
        data: [],
        isLoading: true,
        isSubmitting: true,
        error: null,
      },
    });

    return this.registryOverviewService.submitDecision(action.payload, action.isRevision).pipe(
      tap(() => {
        ctx.patchState({
          moderationActions: {
            data: [],
            isLoading: false,
            isSubmitting: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'moderationActions', error))
    );
  }

  @Action(ClearRegistryOverview)
  clearRegistryOverview(ctx: StateContext<RegistryOverviewStateModel>) {
    ctx.patchState(REGISTRY_OVERVIEW_DEFAULTS);
  }
}
