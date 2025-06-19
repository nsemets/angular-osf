import { StringOrNull } from '@core/helpers';
import { PreprintFileSource } from '@osf/features/preprints/enums';
import { Preprint } from '@osf/features/preprints/models';

export interface SubmitPreprintStateModel {
  selectedProviderId: StringOrNull;
  createdPreprint: Preprint | null;
  fileSource: PreprintFileSource;
}
