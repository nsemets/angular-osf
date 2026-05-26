import { ResourceLinksJsonApi } from '../common/json-api/links.model';
import { RelatedCountRel } from '../common/json-api/relationships.model';
import { JsonApiResource } from '../common/json-api/resource.model';
import { ItemResponse, ListResponse } from '../common/json-api/responses.model';

import { InstitutionAssets } from './institutions.model';

export type InstitutionsJsonApiResponse = ListResponse<InstitutionDataJsonApi>;
export type InstitutionJsonApiResponse = ItemResponse<InstitutionDataJsonApi>;

export interface InstitutionDataJsonApi extends JsonApiResource<'institutions', InstitutionAttributesJsonApi> {
  relationships: InstitutionRelationshipsJsonApi;
  links: ResourceLinksJsonApi;
}

interface InstitutionAttributesJsonApi {
  assets: InstitutionAssets;
  description: string;
  institutional_request_access_enabled: boolean;
  iri: string;
  iris: string[];
  link_to_external_reports_archive: string;
  logo_path: string;
  name: string;
  ror_iri: string | null;
}

interface InstitutionRelationshipsJsonApi {
  user_metrics: RelatedCountRel;
}
