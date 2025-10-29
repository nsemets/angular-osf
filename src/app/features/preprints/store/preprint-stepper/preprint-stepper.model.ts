import { PreprintFileSource } from '@osf/features/preprints/enums';
import { PreprintFilesLinks, PreprintModel } from '@osf/features/preprints/models';
import { LicenseModel } from '@osf/shared/models/license/license.model';
import { StringOrNull } from '@shared/helpers/types.helper';
import { AsyncStateModel, FileFolderModel, FileModel, IdName } from '@shared/models';

export interface PreprintStepperStateModel {
  selectedProviderId: StringOrNull;
  preprint: AsyncStateModel<PreprintModel | null>;
  fileSource: PreprintFileSource;
  preprintFilesLinks: AsyncStateModel<PreprintFilesLinks | null>;
  preprintFile: AsyncStateModel<FileModel | null>;
  availableProjects: AsyncStateModel<IdName[]>;
  projectFiles: AsyncStateModel<FileModel[]>;
  licenses: AsyncStateModel<LicenseModel[]>;
  currentFolder: AsyncStateModel<FileFolderModel | null>;
  preprintProject: AsyncStateModel<IdName | null>;
  hasBeenSubmitted: boolean;
  institutionsChanged: boolean;
}
