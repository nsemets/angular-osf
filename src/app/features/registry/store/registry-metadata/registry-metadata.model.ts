import {
  CedarMetadataRecord,
  CedarMetadataRecordData,
  CedarMetadataTemplateJsonApi,
} from '@osf/features/project/metadata/models';
import { AsyncStateModel } from '@shared/models';

import { RegistryOverview } from '../../models';
import {
  BibliographicContributor,
  CrossRefFunder,
  CustomItemMetadataRecord,
  RegistrySubjectData,
  UserInstitution,
} from '../../models/registry-metadata.models';

export interface RegistryMetadataStateModel {
  registry: AsyncStateModel<RegistryOverview | null>;
  bibliographicContributors: AsyncStateModel<BibliographicContributor[]>;
  customItemMetadata: AsyncStateModel<CustomItemMetadataRecord | null>;
  fundersList: AsyncStateModel<CrossRefFunder[]>;
  userInstitutions: AsyncStateModel<UserInstitution[]>;
  subjects: AsyncStateModel<RegistrySubjectData[]>;
  cedarTemplates: AsyncStateModel<CedarMetadataTemplateJsonApi | null>;
  cedarRecord: AsyncStateModel<CedarMetadataRecord | null>;
  cedarRecords: AsyncStateModel<CedarMetadataRecordData[]>;
}
