import {
  CedarMetadataRecord,
  CedarMetadataRecordData,
  CustomItemMetadataRecord,
} from '@osf/features/project/metadata/models';

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

export class GetCedarMetadataTemplates {
  static readonly type = '[Project Metadata] Get Cedar Metadata Templates';
  constructor(public url?: string) {}
}

export class ResetCustomItemMetadata {
  static readonly type = '[Metadata] Reset Custom Item Metadata';
}

export class GetCedarMetadataRecords {
  static readonly type = '[Project Metadata] Get Cedar Metadata Records';
  constructor(public projectId: string) {}
}

export class CreateCedarMetadataRecord {
  static readonly type = '[Project Metadata] Create Cedar Metadata Record';
  constructor(public record: CedarMetadataRecord) {}
}

export class UpdateCedarMetadataRecord {
  static readonly type = '[Project Metadata] Update Cedar Metadata Record';
  constructor(
    public record: CedarMetadataRecord,
    public recordId: string
  ) {}
}

export class AddCedarMetadataRecordToState {
  static readonly type = '[Project Metadata] Add Cedar Metadata Record To State';
  constructor(public record: CedarMetadataRecordData) {}
}
