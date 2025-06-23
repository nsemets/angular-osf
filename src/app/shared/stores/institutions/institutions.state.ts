import { Action, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { InstitutionsService } from '@shared/services';
import { GetInstitutions, GetUserInstitutions, InstitutionsStateModel } from '@shared/stores';

@State<InstitutionsStateModel>({
  name: 'institutions',
  defaults: {
    userInstitutions: [],
    institutions: {
      data: [],
      isLoading: false,
      error: null,
      isSubmitting: false,
      totalCount: 0,
    },
  },
})
@Injectable()
export class InstitutionsState {
  private readonly institutionsService = inject(InstitutionsService);

  @Action(GetUserInstitutions)
  getUserInstitutions(ctx: StateContext<InstitutionsStateModel>) {
    return this.institutionsService.getUserInstitutions().pipe(
      tap((institutions) => {
        ctx.patchState({
          userInstitutions: institutions,
        });
      })
    );
  }

  @Action(GetInstitutions)
  getInstitutions(ctx: StateContext<InstitutionsStateModel>, action: GetInstitutions) {
    return this.institutionsService.getInstitutions(action.pageNumber, action.pageSize, action.searchValue).pipe(
      tap((response) => {
        ctx.setState(
          patch({
            institutions: patch({
              data: response.data,
              totalCount: response.total,
              isSubmitting: false,
              error: null,
              isLoading: false,
            }),
          })
        );
      })
    );
  }
}
