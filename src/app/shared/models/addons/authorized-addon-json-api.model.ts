import { ToOneRel } from '../common/json-api/relationships.model';
import { JsonApiResource, JsonApiResourceRef } from '../common/json-api/resource.model';
import { JsonApiResponse } from '../common/json-api/responses.model';

import { IncludedAddonData } from './addon-included-json-api.model';

export type AuthorizedAddonResponseJsonApi = JsonApiResponse<AuthorizedAddonDataJsonApi, IncludedAddonData[]>;
export type AuthorizedAddonListResponseJsonApi = JsonApiResponse<AuthorizedAddonDataJsonApi[], IncludedAddonData[]>;

export interface AuthorizedAddonDataJsonApi extends JsonApiResource<string, AuthorizedAddonAttributesJsonApi> {
  relationships: AuthorizedAddonRelationshipsJsonApi;
}

export interface AuthorizedAddonRequestJsonApi {
  data: {
    id?: string;
    type: string;
    attributes: {
      api_base_url: string;
      auth_url: string | null;
      authorized_capabilities: string[];
      credentials: Record<string, unknown>;
      credentials_available: boolean;
      display_name: string;
      initiate_oauth: boolean;
    };
    relationships: AuthorizedAddonRequestRelationshipsJsonApi;
  };
}

interface AuthorizedAddonAttributesJsonApi {
  api_base_url: string;
  auth_url: string | null;
  authorized_capabilities: string[];
  authorized_operation_names: string[];
  credentials_available: boolean;
  default_root_folder: string;
  display_name: string;
  oauth_token?: string;
}

interface AuthorizedAddonRelationshipsJsonApi {
  account_owner: {
    data: JsonApiResourceRef<'user-references'>;
  };
  external_citation_service?: ToOneRel<'external-citation-services'>;
  external_link_service?: ToOneRel<'external-link-services'>;
  external_storage_service?: ToOneRel<'external-storage-services'>;
}

interface AuthorizedAddonRequestRelationshipsJsonApi {
  account_owner: {
    data: JsonApiResourceRef<'user-references'>;
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
