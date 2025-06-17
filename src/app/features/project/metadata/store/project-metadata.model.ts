import {
  CedarMetadataRecord,
  CedarMetadataRecordData,
  CedarMetadataTemplateJsonApi,
  CrossRefFunder,
  CustomItemMetadataRecord,
} from '../models';

export interface MetadataStateModel {
  customItemMetadata: CustomItemMetadataRecord | null;
  customItemMetadataLoading: boolean;
  fundersList: CrossRefFunder[];
  loading: boolean;
  fundersLoading: boolean;
  error: string | null;
  cedarTemplates: CedarMetadataTemplateJsonApi | null;
  cedarTemplatesLoading: boolean;
  cedarRecord: CedarMetadataRecord | null;
  cedarRecordLoading: boolean;
  cedarRecords: CedarMetadataRecordData[];
  cedarRecordsLoading: boolean;
}
