import { Action, State, StateContext } from '@ngxs/store';

import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { Project } from '../models';
import { ProjectsService, ProvidersService, RegistriesService } from '../services';

import {
  AddContributor,
  CreateDraft,
  DeleteContributor,
  DeleteDraft,
  FetchContributors,
  GetProjects,
  GetProviders,
  UpdateContributor,
} from './registries.actions';
import { RegistriesStateModel } from './registries.model';

const DefaultState: RegistriesStateModel = {
  providers: {
    data: [],
    isLoading: false,
    error: null,
  },
  projects: {
    data: [],
    isLoading: false,
    error: null,
  },
  draftRegistration: {
    isLoading: false,
    data: null,
    isSubmitting: false,
    error: null,
  },
  contributorsList: {
    data: [],
    isLoading: false,
    error: null,
  },
};

@State<RegistriesStateModel>({
  name: 'registries',
  defaults: { ...DefaultState },
})
@Injectable()
export class RegistriesState {
  constructor(
    private providersService: ProvidersService,
    private projectsService: ProjectsService,
    private registriesService: RegistriesService
  ) {}

  @Action(GetProjects)
  getProjects({ patchState }: StateContext<RegistriesStateModel>) {
    patchState({
      projects: {
        ...DefaultState.projects,
        isLoading: true,
      },
    });
    return this.projectsService.getProjects().subscribe({
      next: (projects: Project[]) => {
        patchState({
          projects: {
            data: projects,
            isLoading: false,
            error: null,
          },
        });
      },
      error: (error) => {
        patchState({
          projects: { ...DefaultState.projects, isLoading: false, error },
        });
      },
    });
  }

  @Action(GetProviders)
  getProviders({ patchState }: StateContext<RegistriesStateModel>) {
    patchState({
      providers: {
        ...DefaultState.providers,
        isLoading: true,
      },
    });

    return this.providersService.getProviders().subscribe({
      next: (providers) => {
        patchState({
          providers: {
            data: providers,
            isLoading: false,
            error: null,
          },
        });
      },
      error: (error) => {
        patchState({
          providers: {
            ...DefaultState.providers,
            isLoading: false,
            error,
          },
        });
      },
    });
  }

  @Action(CreateDraft)
  createDraft(ctx: StateContext<RegistriesStateModel>, { payload }: CreateDraft) {
    ctx.patchState({
      draftRegistration: {
        ...ctx.getState().draftRegistration,
        isSubmitting: true,
      },
    });

    return this.registriesService.createDraft(payload.registrationSchemaId, payload.projectId).pipe(
      tap(() => {
        ctx.patchState({
          draftRegistration: {
            ...ctx.getState().draftRegistration,
            isSubmitting: false,
            error: null,
          },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          draftRegistration: {
            ...ctx.getState().draftRegistration,
            isSubmitting: false,
            error: error.message,
          },
        });
        return this.handleError(ctx, 'draftRegistration', error);
      })
    );
  }

  @Action(DeleteDraft)
  deleteDraft(ctx: StateContext<RegistriesStateModel>, { draftId }: DeleteDraft) {
    ctx.patchState({
      draftRegistration: {
        ...ctx.getState().draftRegistration,
        isSubmitting: true,
      },
    });

    return this.registriesService.deleteDraft(draftId).pipe(
      tap(() => {
        ctx.patchState({
          draftRegistration: {
            ...ctx.getState().draftRegistration,
            isSubmitting: false,
            data: null,
            error: null,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'draftRegistration', error))
    );
  }

  @Action(FetchContributors)
  fetchContributors(ctx: StateContext<RegistriesStateModel>, action: FetchContributors) {
    const state = ctx.getState();

    ctx.patchState({
      contributorsList: { ...state.contributorsList, isLoading: true, error: null },
    });

    return this.registriesService.getContributors(action.draftId).pipe(
      tap((contributors) => {
        ctx.patchState({
          contributorsList: {
            ...state.contributorsList,
            data: contributors,
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'contributorsList', error))
    );
  }

  @Action(AddContributor)
  addContributor(ctx: StateContext<RegistriesStateModel>, action: AddContributor) {
    const state = ctx.getState();

    ctx.patchState({
      contributorsList: { ...state.contributorsList, isLoading: true, error: null },
    });

    return this.registriesService.addContributor(action.draftId, action.contributor).pipe(
      tap((contributor) => {
        const currentState = ctx.getState();

        ctx.patchState({
          contributorsList: {
            ...currentState.contributorsList,
            data: [...currentState.contributorsList.data, contributor],
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'contributorsList', error))
    );
  }

  @Action(UpdateContributor)
  updateContributor(ctx: StateContext<RegistriesStateModel>, action: UpdateContributor) {
    const state = ctx.getState();

    ctx.patchState({
      contributorsList: { ...state.contributorsList, isLoading: true, error: null },
    });

    return this.registriesService.updateContributor(action.draftId, action.contributor).pipe(
      tap((updatedContributor) => {
        const currentState = ctx.getState();

        ctx.patchState({
          contributorsList: {
            ...currentState.contributorsList,
            data: currentState.contributorsList.data.map((contributor) =>
              contributor.id === updatedContributor.id ? updatedContributor : contributor
            ),
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'contributorsList', error))
    );
  }

  @Action(DeleteContributor)
  deleteContributor(ctx: StateContext<RegistriesStateModel>, action: DeleteContributor) {
    const state = ctx.getState();

    ctx.patchState({
      contributorsList: { ...state.contributorsList, isLoading: true, error: null },
    });

    return this.registriesService.deleteContributor(action.draftId, action.contributorId).pipe(
      tap(() => {
        ctx.patchState({
          contributorsList: {
            ...state.contributorsList,
            data: state.contributorsList.data.filter((contributor) => contributor.userId !== action.contributorId),
            isLoading: false,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, 'contributorsList', error))
    );
  }

  private handleError(ctx: StateContext<RegistriesStateModel>, section: keyof RegistriesStateModel, error: Error) {
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
