import { BrandDataJsonApi } from '../brand/brand.json-api.model';
import { Embed } from '../common/json-api/embeds.model';
import { ToOneRel } from '../common/json-api/relationships.model';
import { JsonApiResource } from '../common/json-api/resource.model';
import { ItemResponse } from '../common/json-api/responses.model';
import { CollectionsProviderAttributesJsonApi } from '../provider/collections-provider-json-api.model';

export type CollectionProviderGetResponseJsonApi = ItemResponse<CollectionProviderDataJsonApi>;

export interface CollectionProviderDataJsonApi extends JsonApiResource<
  'collection-providers',
  CollectionsProviderAttributesJsonApi
> {
  embeds: CollectionProviderEmbedsJsonApi;
  relationships: CollectionProviderRelationshipsJsonApi;
}

interface CollectionProviderEmbedsJsonApi {
  brand: Embed<BrandDataJsonApi>;
}

interface CollectionProviderRelationshipsJsonApi {
  primary_collection: ToOneRel<'collections'>;
}
