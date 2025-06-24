import { Selector } from '@ngxs/store';

import { License } from '@shared/models';
import { LicensesState, LicensesStateModel } from '@shared/stores/licenses';

export class LicensesSelectors {
  @Selector([LicensesState])
  static getLicenses(state: LicensesStateModel): License[] {
    return state.licenses.data;
  }

  @Selector([LicensesState])
  static getLoading(state: LicensesStateModel): boolean {
    return state.licenses.isLoading;
  }

  @Selector([LicensesState])
  static getError(state: LicensesStateModel): string | null {
    return state.licenses.error;
  }
}
