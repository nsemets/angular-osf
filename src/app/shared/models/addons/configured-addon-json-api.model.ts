import { ResourceLinksJsonApi } from '../common/json-api/links.model';
import { ToOneRel } from '../common/json-api/relationships.model';
import { JsonApiResource, JsonApiResourceRef } from '../common/json-api/resource.model';
import { ItemResponse, JsonApiResponse } from '../common/json-api/responses.model';

import { IncludedAddonData } from './addon-included-json-api.model';

export type ConfiguredAddonListResponseJsonApi = JsonApiResponse<ConfiguredAddonDataJsonApi[], IncludedAddonData[]>;
export type ConfiguredAddonItemResponseJsonApi = ItemResponse<ConfiguredAddonDataJsonApi>;

export interface ConfiguredAddonDataJsonApi extends JsonApiResource<string, ConfiguredAddonAttributesJsonApi> {
  relationships: ConfiguredAddonRelationshipsJsonApi;
}

export interface ConfiguredAddonResponseDataJsonApi extends JsonApiResource<string, ConfiguredAddonAttributesJsonApi> {
  links: Pick<ResourceLinksJsonApi, 'self'>;
  relationships: ConfiguredAddonResponseRelationshipsJsonApi;
}

export interface ConfiguredAddonRequestJsonApi {
  data: {
    attributes: {
      authorized_resource_uri: string;
      connected_capabilities: string[];
      connected_operation_names: string[];
      display_name: string;
      external_service_name: string;
      root_folder?: string | null;
      target_id?: string | null;
      target_url?: string | null;
    };
    relationships: {
      account_owner: {
        data: JsonApiResourceRef<'user-references'>;
      };
      authorized_resource?: {
        data: JsonApiResourceRef;
      };
      base_account: {
        data: JsonApiResourceRef;
      };
      external_citation_service?: {
        data: JsonApiResourceRef<'external-citation-services'>;
      };
      external_storage_service?: {
        data: JsonApiResourceRef<'external-storage-services'>;
      };
    };
    type: string;
    id?: string;
  };
}

interface ConfiguredAddonAttributesJsonApi {
  connected_capabilities: string[];
  connected_operation_names: string[];
  current_user_is_owner: boolean;
  display_name: string;
  external_service_name: string;
  resource_type?: string;
  root_folder?: string;
  target_id?: string;
  target_url?: string;
}

interface ConfiguredAddonRelationshipsJsonApi {
  base_account: {
    data: JsonApiResourceRef;
  };
  external_citation_service?: ToOneRel<'external-citation-services'>;
  external_link_service?: ToOneRel<'external-link-services'>;
  external_storage_service?: ToOneRel<'external-storage-services'>;
}

interface ConfiguredAddonResponseRelationshipsJsonApi {
  base_account: {
    data: JsonApiResourceRef;
  };
  authorized_resource?: {
    data: JsonApiResourceRef;
  };
  external_citation_service?: {
    data: JsonApiResourceRef<'external-citation-services'>;
  };
  external_link_service?: {
    data: JsonApiResourceRef<'external-link-services'>;
  };
  external_storage_service?: {
    data: JsonApiResourceRef<'external-storage-services'>;
  };
}
