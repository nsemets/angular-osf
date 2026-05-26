import { JsonApiResource } from '@osf/shared/models/common/json-api/resource.model';
import { ItemResponse, ListResponse } from '@osf/shared/models/common/json-api/responses.model';

import { ScopeJsonApiResponse } from './scope-json-api.model';

export type TokensListResponseJsonApi = ListResponse<TokenDataJsonApi>;
export type TokenResponseJsonApi = ItemResponse<TokenDataJsonApi>;

export interface TokenDataJsonApi extends JsonApiResource<'tokens', TokenAttributesJsonApi> {
  embeds: TokenEmbedsJsonApi;
}

export interface TokenCreateRequestJsonApi {
  data: {
    attributes: {
      name: string;
      scopes: string;
    };
    type: 'tokens';
  };
}

interface TokenAttributesJsonApi {
  name: string;
  token_id: string;
}

interface TokenEmbedsJsonApi {
  scopes: ScopeJsonApiResponse;
}
