import { IdName } from '@osf/shared/models/common/id-name.model';
import { AsyncStateModel } from '@osf/shared/models/store/async-state.model';

export interface RegionsStateModel {
  regions: AsyncStateModel<IdName[]>;
}

export const REGIONS_STATE_DEFAULTS = {
  regions: {
    data: [],
    isLoading: false,
    error: null,
  },
};
