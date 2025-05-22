import { Action, State, StateContext } from '@ngxs/store';

import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { ProjectSettingsModel } from '@osf/features/project/settings';
import { SettingsService } from '@osf/features/project/settings/services';
import { GetProjectSettings } from '@osf/features/project/settings/store/settings.actions';
import { SettingsStateModel } from '@osf/features/project/settings/store/settings.model';

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    settings: {
      data: {} as ProjectSettingsModel,
      isLoading: false,
      error: null,
    },
  },
})
@Injectable()
export class SettingsState {
  private readonly settingsService = inject(SettingsService);

  @Action(GetProjectSettings)
  getProjectSettings(ctx: StateContext<SettingsStateModel>, action: GetProjectSettings) {
    ctx.patchState({
      settings: {
        ...ctx.getState().settings,
        isLoading: true,
        error: null,
      },
    });

    return this.settingsService.getProjectSettings(action.projectId).pipe(
      tap((settings) => {
        ctx.patchState({
          settings: {
            data: settings,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => {
        ctx.patchState({
          settings: {
            ...ctx.getState().settings,
            isLoading: false,
            error: error?.message || 'Failed to load project settings',
          },
        });
        return of(error);
      })
    );
  }
}
