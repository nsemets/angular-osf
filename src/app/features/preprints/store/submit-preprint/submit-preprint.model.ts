import { StringOrNull } from '@core/helpers';
import { PreprintFileSource } from '@osf/features/preprints/enums';
import { Preprint, PreprintFilesLinks } from '@osf/features/preprints/models';
import { OsfFile } from '@osf/features/project/files/models';
import { AsyncStateModel } from '@shared/models';

export interface SubmitPreprintStateModel {
  selectedProviderId: StringOrNull;
  createdPreprint: Preprint | null;
  fileSource: PreprintFileSource;
  preprintFilesLinks: PreprintFilesLinks | null;
  preprintFiles: AsyncStateModel<OsfFile[]>;
}
