import { BrandDataJsonApi } from '../brand/brand.json-api.model';
import { JsonApiResponse } from '../common/json-api.model';
import { BaseNodeDataJsonApi } from '../nodes/base-node-data-json-api.model';
import { CollectionsProviderAttributesJsonApi } from '../provider/collections-provider-json-api.model';
import { UserDataErrorResponseJsonApi } from '../user/user-json-api.model';

export interface CollectionProviderResponseJsonApi {
  id: string;
  type: string;
  attributes: CollectionsProviderAttributesJsonApi;
  embeds: {
    brand: {
      data?: BrandDataJsonApi;
    };
  };
  relationships: {
    primary_collection: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface CollectionDetailsResponseJsonApi {
  id: string;
  type: string;
  attributes: {
    title: string;
    date_created: string;
    date_modified: string;
    bookmarks: boolean;
    is_promoted: boolean;
    is_public: boolean;
    status_choices: string[];
    collected_type_choices: string[];
    volume_choices: string[];
    issue_choices: string[];
    program_area_choices: string[];
    school_type_choices: string[];
    study_design_choices: string[];
    data_type_choices: string[];
    disease_choices: string[];
    grade_levels_choices: string[];
  };
}

export interface CollectionSubmissionJsonApi {
  id: string;
  type: string;
  attributes: {
    reviews_state: string;
    collected_type: string;
    status: string;
    volume: string;
    issue: string;
    program_area: string;
    school_type: string;
    study_design: string;
    data_type: string;
    disease: string;
    grade_levels: string;
  };
  embeds: {
    collection: {
      data: {
        attributes: {
          title: string;
        };
        relationships: {
          provider: {
            data: {
              id: string;
            };
          };
        };
      };
    };
  };
}

export interface CollectionSubmissionWithGuidJsonApi {
  id: string;
  type: string;
  attributes: {
    reviews_state: string;
    collected_type: string;
    status: string;
    volume: string;
    issue: string;
    program_area: string;
    school_type: string;
    study_design: string;
    data_type: string;
    disease: string;
    grade_levels: string;
  };
  embeds: {
    guid: {
      data: BaseNodeDataJsonApi;
    };
    creator?: UserDataErrorResponseJsonApi;
  };
}

export interface SparseCollectionAttributesJsonApi {
  title: string;
  bookmarks: boolean;
}

export interface SparseCollectionJsonAi {
  id: string;
  attributes: SparseCollectionAttributesJsonApi;
}

export interface SparseCollectionsResponseJsonApi {
  data: SparseCollectionJsonAi[];
}

export interface CollectionDetailsGetResponseJsonApi extends JsonApiResponse<CollectionDetailsResponseJsonApi, null> {
  data: CollectionDetailsResponseJsonApi;
}

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
