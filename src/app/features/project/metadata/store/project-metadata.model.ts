import { CedarMetadataTemplate, CrossRefFunder, CustomItemMetadataRecord } from '@osf/features/project/metadata/models';

export interface MetadataStateModel {
  customItemMetadata: CustomItemMetadataRecord | null;
  fundersList: CrossRefFunder[];
  loading: boolean;
  fundersLoading: boolean;
  error: string | null;
  cedarTemplates: CedarMetadataTemplate | null;
  cedarTemplatesLoading: boolean;
}
