import { CrossRefFunder, CustomItemMetadataRecord } from '@osf/features/project/metadata/models/metadata.models';

export interface MetadataStateModel {
  customItemMetadata: CustomItemMetadataRecord | null;
  fundersList: CrossRefFunder[];
  loading: boolean;
  fundersLoading: boolean;
  error: string | null;
}
