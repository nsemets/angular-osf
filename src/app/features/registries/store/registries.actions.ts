import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { LicenseOptions } from '@osf/shared/models/license/license.model';
import {
  DraftRegistrationAttributesJsonApi,
  DraftRegistrationRelationshipsJsonApi,
} from '@osf/shared/models/registration/registration-json-api.model';

import { SchemaActionTrigger } from '../enums';

export class GetRegistries {
  static readonly type = '[Registries] Get Registries';
}

export class GetProviderSchemas {
  static readonly type = '[Registries]  Get Provider Schemas';

  constructor(public providerId: string) {}
}

export class GetProjects {
  static readonly type = '[Registries] Get Projects';

  constructor(
    public userId: string,
    public search: string
  ) {}
}

export class CreateDraft {
  static readonly type = '[Registries]  Create Draft';

  constructor(public payload: { registrationSchemaId: string; provider: string; projectId?: string }) {}
}

export class FetchDraft {
  static readonly type = '[Registries]  Fetch Draft';

  constructor(public draftId: string) {}
}

export class UpdateDraft {
  static readonly type = '[Registries] Update Registration Tags';

  constructor(
    public draftId: string,
    public attributes: Partial<DraftRegistrationAttributesJsonApi>,
    public relationships?: Partial<DraftRegistrationRelationshipsJsonApi>
  ) {}
}

export class DeleteDraft {
  static readonly type = '[Registries]  Delete Draft';

  constructor(public draftId: string) {}
}

export class RegisterDraft {
  static readonly type = '[Registries]  Register Draft Registration';

  constructor(
    public draftId: string,
    public embargoDate: string,
    public providerId: string,
    public projectId?: string,
    public components?: string[]
  ) {}
}

export class FetchSchemaBlocks {
  static readonly type = '[Registries] Fetch Schema Blocks';

  constructor(public registrationSchemaId: string) {}
}

export class FetchLicenses {
  static readonly type = '[Registries] Fetch Licenses';

  constructor(public providerId: string) {}
}

export class SaveLicense {
  static readonly type = '[Registries] Save License';

  constructor(
    public registrationId: string,
    public licenseId: string,
    public licenseOptions?: LicenseOptions
  ) {}
}

export class UpdateStepState {
  static readonly type = '[Registries] Update Step Validation';

  constructor(
    public step: string,
    public invalid: boolean,
    public touched: boolean
  ) {}
}

export class FetchDraftRegistrations {
  static readonly type = '[Registries] Fetch Draft Registrations';

  constructor(
    public page = 1,
    public pageSize = 10
  ) {}
}

export class FetchSubmittedRegistrations {
  static readonly type = '[Registries] Fetch Submitted Registrations';

  constructor(
    public userId: string | undefined,
    public page = 1,
    public pageSize = 10
  ) {}
}

export class FetchProjectChildren {
  static readonly type = '[Registries] Fetch Project Children';

  constructor(public projectId: string) {}
}

export class ClearState {
  static readonly type = '[Registries] Clear State';
}

export class GetFiles {
  static readonly type = '[Registries] Get Files';

  constructor(
    public filesLink: string,
    public page: number
  ) {}
}

export class SetFilesIsLoading {
  static readonly type = '[Registries] Set Files Loading';

  constructor(public isLoading: boolean) {}
}

export class GetRootFolders {
  static readonly type = '[Registries] Get Folders';

  constructor(public folderLink: string) {}
}

export class CreateFolder {
  static readonly type = '[Registries] Create folder';

  constructor(
    public newFolderLink: string,
    public folderName: string
  ) {}
}

export class SetCurrentFolder {
  static readonly type = '[Registries] Set Current Folder';

  constructor(public folder: FileFolderModel | null) {}
}

export class FetchAllSchemaResponses {
  static readonly type = '[Registries] Fetch  All Schema Responses';

  constructor(public registrationId: string) {}
}

export class FetchSchemaResponse {
  static readonly type = '[Registries] Fetch Schema Response';

  constructor(public schemaResponseId: string) {}
}

export class CreateSchemaResponse {
  static readonly type = '[Registries] Create Schema Response';

  constructor(public registrationId: string) {}
}

export class UpdateSchemaResponse {
  static readonly type = '[Registries] Update Schema Response';

  constructor(
    public schemaResponseId: string,
    public revisionJustification: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public revisionResponses?: Record<string, any>
  ) {}
}

export class HandleSchemaResponse {
  static readonly type = '[Registries] Handle Schema Response';

  constructor(
    public schemaResponseId: string,
    public trigger: SchemaActionTrigger,
    public comment?: string
  ) {}
}

export class DeleteSchemaResponse {
  static readonly type = '[Registries] Delete Schema Response';

  constructor(public schemaResponseId: string) {}
}

export class SetUpdatedFields {
  static readonly type = '[Registries] Set Updated Fields';

  constructor(public updatedFields: Record<string, unknown>) {}
}
