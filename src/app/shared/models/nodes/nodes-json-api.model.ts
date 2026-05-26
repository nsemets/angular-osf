import { ItemResponse, ListResponse } from '../common/json-api/responses.model';

import { BaseNodeDataJsonApi } from './base-node-data-json-api.model';

export type NodesResponseJsonApi = ListResponse<BaseNodeDataJsonApi>;
export type NodeResponseJsonApi = ItemResponse<BaseNodeDataJsonApi>;

export interface UpdateNodeRequestModel {
  data: {
    id: string;
    type: 'nodes';
    attributes?: UpdateNodeAttributesJsonApi;
  };
}

export interface CreateProjectPayloadJsoApi {
  data: {
    type: 'nodes';
    attributes: {
      title: string;
      description?: string;
      category: 'project';
      template_from?: string;
      public: boolean;
    };
    relationships: {
      region: { data: { type: 'regions'; id: string } };
      affiliated_institutions?: { data: { type: 'institutions'; id: string }[] };
    };
  };
}

interface UpdateNodeAttributesJsonApi {
  description?: string;
  tags?: string[];
  public?: boolean;
  title?: string;
}
