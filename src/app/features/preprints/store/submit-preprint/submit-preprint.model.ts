import { StringOrNull } from '@core/helpers';
import { Preprint } from '@osf/features/preprints/models';

export interface SubmitPreprintStateModel {
  selectedProviderId: StringOrNull;
  createdPreprint: Preprint | null;
}
