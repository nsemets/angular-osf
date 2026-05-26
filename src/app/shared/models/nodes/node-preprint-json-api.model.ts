import { ResourceLinksJsonApi } from '../common/json-api/links.model';
import { ItemResponse, ListResponse } from '../common/json-api/responses.model';

export type NodePreprintResponseJsonApi = ItemResponse<NodePreprintDataJsonApi>;
export type NodePreprintsResponseJsonApi = ListResponse<NodePreprintDataJsonApi>;

export interface NodePreprintDataJsonApi {
  id: string;
  attributes: NodePreprintAttributesJsonApi;
  links: ResourceLinksJsonApi;
}

export interface NodePreprintAttributesJsonApi {
  title: string;
  date_created: string;
  date_modified: string;
  date_published: string;
  doi: string;
  is_preprint_orphan: boolean;
  is_published: boolean;
  license_record: string;
}
