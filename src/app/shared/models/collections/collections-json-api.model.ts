import { CollectionSubmissionReviewState } from '@osf/shared/enums/collection-submission-review-state.enum';

import { BrandDataJsonApi } from '../brand/brand.json-api.model';
import { Embed } from '../common/json-api/embeds.model';
import { ToOneRel } from '../common/json-api/relationships.model';
import { JsonApiResource, JsonApiResourceRef } from '../common/json-api/resource.model';
import { ItemResponse, ListResponse } from '../common/json-api/responses.model';
import { BaseNodeDataJsonApi } from '../nodes/base-node-data-json-api.model';
import { CollectionsProviderAttributesJsonApi } from '../provider/collections-provider-json-api.model';
import { UserDataErrorResponseJsonApi } from '../user/user-json-api.model';

export type CollectionDetailsItemResponseJsonApi = ItemResponse<CollectionDetailsDataJsonApi>;
export type CollectionDetailsListResponseJsonApi = ListResponse<CollectionDetailsDataJsonApi>;
export type CollectionProviderGetResponseJsonApi = ItemResponse<CollectionProviderDataJsonApi>;
export type SparseCollectionsResponseJsonApi = ListResponse<SparseCollectionDataJsonApi>;
export type CollectionSubmissionWithGuidResponseJsonApi = ItemResponse<CollectionSubmissionWithGuidDataJsonApi>;
export type CollectionSubmissionWithGuidListResponseJsonApi = ListResponse<CollectionSubmissionWithGuidDataJsonApi>;
export type CollectionSubmissionJsonApi = ItemResponse<CollectionSubmissionDataJsonApi>;

export interface CollectionProviderDataJsonApi extends JsonApiResource<
  'collection-providers',
  CollectionsProviderAttributesJsonApi
> {
  embeds: CollectionProviderEmbedsJsonApi;
  relationships: CollectionProviderRelationshipsJsonApi;
}

export type CollectionDetailsDataJsonApi = JsonApiResource<'collections', CollectionDetailsAttributesJsonApi>;

export interface CollectionSubmissionDataJsonApi extends JsonApiResource<
  'collection-submissions',
  CollectionSubmissionAttributesJsonApi
> {
  embeds: CollectionSubmissionEmbedsJsonApi;
}

export interface CollectionSubmissionWithGuidDataJsonApi extends JsonApiResource<
  'collection-submissions',
  CollectionSubmissionAttributesJsonApi
> {
  embeds: CollectionSubmissionWithGuidEmbedsJsonApi;
}

export type SparseCollectionDataJsonApi = JsonApiResource<'collections', SparseCollectionAttributesJsonApi>;

export interface CollectionSubmissionsSearchPayloadJsonApi {
  data: {
    attributes: {
      provider: string[];
      studyDesign?: string[];
      schoolType?: string[];
      status?: string[];
      collectedType?: string[];
      volume?: string[];
      issue?: string[];
      programArea?: string[];
      dataType?: string[];
      disease?: string[];
      gradeLevels?: string[];
      q?: string;
    };
  };
  type: string;
}

interface CollectionDetailsAttributesJsonApi {
  bookmarks: boolean;
  collected_type_choices: string[];
  data_type_choices: string[];
  date_created: string;
  date_modified: string;
  disease_choices: string[];
  grade_levels_choices: string[];
  is_promoted: boolean;
  is_public: boolean;
  issue_choices: string[];
  program_area_choices: string[];
  school_type_choices: string[];
  status_choices: string[];
  study_design_choices: string[];
  title: string;
  volume_choices: string[];
}

interface CollectionSubmissionAttributesJsonApi {
  collected_type: string;
  data_type: string;
  disease: string;
  grade_levels: string;
  issue: string;
  program_area: string;
  reviews_state: CollectionSubmissionReviewState;
  school_type: string;
  status: string;
  study_design: string;
  volume: string;
}

interface CollectionProviderEmbedsJsonApi {
  brand: Embed<BrandDataJsonApi>;
}

interface CollectionProviderRelationshipsJsonApi {
  primary_collection: ToOneRel<'collections'>;
}

interface CollectionSubmissionEmbedsJsonApi {
  collection: Embed<CollectionSubmissionCollectionEmbedDataJsonApi>;
}

interface CollectionSubmissionWithGuidEmbedsJsonApi {
  guid: Embed<BaseNodeDataJsonApi>;
  creator?: UserDataErrorResponseJsonApi;
}

interface CollectionSubmissionCollectionEmbedDataJsonApi {
  attributes: {
    title: string;
  };
  relationships: {
    provider: {
      data: JsonApiResourceRef;
    };
  };
}

interface SparseCollectionAttributesJsonApi {
  bookmarks: boolean;
  title: string;
}
