import { AsyncStateModel } from '@osf/shared/models';
import { Fork } from '@shared/models/forks';

export interface ForksStateModel {
  forks: AsyncStateModel<Fork[]>;
  totalCount: number;
}

export const FORKS_DEFAULTS: ForksStateModel = {
  forks: {
    data: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
  },
  totalCount: 0,
};
