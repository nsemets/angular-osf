import { CustomItemMetadataRecord } from '@osf/features/project/metadata/models/metadata.models';

export class GetCustomItemMetadata {
  static readonly type = '[Metadata] Get Custom Item Metadata';

  constructor(public guid: string) {}
}

export class UpdateCustomItemMetadata {
  static readonly type = '[Metadata] Update Custom Item Metadata';

  constructor(
    public guid: string,
    public metadata: CustomItemMetadataRecord
  ) {}
}

export class GetFundersList {
  static readonly type = '[Project Metadata] Get Funders List';
  constructor(public search?: string) {}
}

export class ResetCustomItemMetadata {
  static readonly type = '[Metadata] Reset Custom Item Metadata';
}
