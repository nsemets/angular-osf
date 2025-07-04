import { StateContext } from '@ngxs/store';

import { catchError, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { handleSectionError } from '@osf/core/handlers';

import { LicensesService } from '../../services';
import { RegistriesStateModel } from '../registries.model';

@Injectable()
export class LicensesHandlers {
  licensesService = inject(LicensesService);

  fetchLicenses(ctx: StateContext<RegistriesStateModel>) {
    ctx.patchState({
      licenses: {
        ...ctx.getState().licenses,
        isLoading: true,
      },
    });

    return this.licensesService.getLicenses().pipe(
      tap((licenses) => {
        ctx.patchState({
          licenses: {
            data: licenses,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'licenses', error))
    );
  }
}
