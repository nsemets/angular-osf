import { JsonApiResource, JsonApiResourceRef } from '@osf/shared/models/common/json-api/resource.model';
import { JsonApiResponse } from '@osf/shared/models/common/json-api/responses.model';

export type InstitutionIndexValueSearchIncludedJsonApi =
  | InstitutionSearchResultCountJsonApi
  | InstitutionIndexCardFilterJsonApi;

export type InstitutionIndexValueSearchJsonApi = JsonApiResponse<null, InstitutionIndexValueSearchIncludedJsonApi[]>;
export type InstitutionIndexCardFilterJsonApi = JsonApiResource<'index-card', InstitutionIndexCardAttributesJsonApi>;

interface InstitutionIndexCardResourceMetadataJsonApi {
  '@id': string;
  displayLabel?: { '@value': string }[];
  name: { '@value': string }[];
}

interface InstitutionIndexCardAttributesJsonApi {
  resourceIdentifier: string[];
  resourceMetadata: InstitutionIndexCardResourceMetadataJsonApi;
}

interface InstitutionSearchResultAttributesJsonApi {
  cardSearchResultCount: number;
}

interface InstitutionSearchResultRelationshipsJsonApi {
  indexCard: {
    data: JsonApiResourceRef;
  };
}

export interface InstitutionSearchResultCountJsonApi extends Omit<
  JsonApiResource<string, InstitutionSearchResultAttributesJsonApi>,
  'attributes'
> {
  attributes?: InstitutionSearchResultAttributesJsonApi;
  relationships: InstitutionSearchResultRelationshipsJsonApi;
}
