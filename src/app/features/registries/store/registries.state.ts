import { Action, State, StateContext } from '@ngxs/store';

import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { Project } from '../models';
import { ProjectsService, ProvidersService, RegistriesService } from '../services';

import { CreateDraft, GetProjects, GetProviders } from './registries.actions';
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
  registrations: {
    isLoading: false,
    data: null,
    isSubmitting: false,
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
      registrations: {
        ...ctx.getState().registrations,
        isSubmitting: true,
      },
    });

    return this.registriesService.createDraft(payload.registrationSchemaId, payload.projectId).pipe(
      tap(() => {
        ctx.patchState({
          registrations: {
            ...ctx.getState().registrations,
            isSubmitting: false,
            error: null,
          },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          registrations: {
            ...ctx.getState().registrations,
            isSubmitting: false,
            error: error.message,
          },
        });
        return this.handleError(ctx, 'registrations', error);
      })
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
