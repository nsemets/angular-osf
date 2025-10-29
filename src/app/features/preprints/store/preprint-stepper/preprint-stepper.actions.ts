import { StringOrNull } from '@osf/shared/helpers/types.helper';
import { FileModel } from '@osf/shared/models/files/file.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { LicenseOptions } from '@osf/shared/models/license/license.model';

import { PreprintFileSource } from '../../enums';
import { PreprintModel } from '../../models';

export class SetSelectedPreprintProviderId {
  static readonly type = '[Preprint Stepper] Set Selected Preprint Provider Id';

  constructor(public id: StringOrNull) {}
}

export class CreatePreprint {
  static readonly type = '[Preprint Stepper] Create Preprint';

  constructor(
    public title: string,
    public abstract: string,
    public providerId: string
  ) {}
}

export class UpdatePreprint {
  static readonly type = '[Preprint Stepper] Update Preprint';

  constructor(
    public id: string,
    public payload: Partial<PreprintModel>
  ) {}
}

export class FetchPreprintById {
  static readonly type = '[Preprint Stepper] Get Preprint By Id';

  constructor(public id: string) {}
}

export class SetSelectedPreprintFileSource {
  static readonly type = '[Preprint Stepper] Set Selected Preprint File Source';

  constructor(public fileSource: PreprintFileSource) {}
}

export class FetchPreprintFilesLinks {
  static readonly type = '[Preprint Stepper] Get Preprint Files Links';
}

export class UploadFile {
  static readonly type = '[Preprint Stepper] Upload File';

  constructor(public file: File) {}
}

export class UpdatePrimaryFileRelationship {
  static readonly type = '[Preprint Stepper] Update Primary File Relationship';

  constructor(public fileId: string) {}
}

export class ReuploadFile {
  static readonly type = '[Preprint Stepper] Reupload File';

  constructor(public file: File) {}
}

export class CopyFileFromProject {
  static readonly type = '[Preprint Stepper] Copy File From Project';

  constructor(public file: FileModel) {}
}

export class FetchPreprintPrimaryFile {
  static readonly type = '[Preprint Stepper] Fetch Preprint Primary File';
}

export class FetchAvailableProjects {
  static readonly type = '[Preprint Stepper] Get Available Projects';

  constructor(public searchTerm: StringOrNull) {}
}

export class SetProjectRootFolder {
  static readonly type = '[Preprint Stepper] Set Project Root Folder';

  constructor(public projectId: string) {}
}

export class FetchProjectFilesByLink {
  static readonly type = '[Preprint Stepper] Get Project Files By Link';

  constructor(public filesLink: string) {}
}

export class FetchLicenses {
  static readonly type = '[Preprint Stepper] Fetch Licenses';
}

export class SaveLicense {
  static readonly type = '[Preprint Stepper] Save License';

  constructor(
    public licenseId: string,
    public licenseOptions?: LicenseOptions
  ) {}
}

export class DisconnectProject {
  static readonly type = '[Preprint Stepper] Disconnect Preprint Project';
}

export class ConnectProject {
  static readonly type = '[Preprint Stepper] Connect Preprint Project';

  constructor(public projectId: string) {}
}

export class FetchPreprintProject {
  static readonly type = '[Preprint Stepper] Fetch Preprint Project';
}

export class CreateNewProject {
  static readonly type = '[Preprint Stepper] Create Project';

  constructor(
    public title: string,
    public description: string,
    public templateFrom: string,
    public regionId: string,
    public affiliationsId: string[]
  ) {}
}

export class SubmitPreprint {
  static readonly type = '[Preprint Stepper] Preprint Stepper';
}

export class CreateNewVersion {
  static readonly type = '[Preprint Stepper] Create New Version';

  constructor(public preprintId: string) {}
}

export class ResetState {
  static readonly type = '[Preprint Stepper] Reset State';
}

export class DeletePreprint {
  static readonly type = '[Preprint Stepper]  Delete Preprint';
}

export class SetCurrentFolder {
  static readonly type = '[Preprint Stepper] Set Current Folder';

  constructor(public folder: FileFolderModel | null) {}
}

export class SetInstitutionsChanged {
  static readonly type = '[Preprint Stepper] Set Institutions Changed';

  constructor(public institutionsChanged: boolean) {}
}
