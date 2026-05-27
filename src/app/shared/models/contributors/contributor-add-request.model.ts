import { JsonApiResourceRef } from '../common/json-api/resource.model';

export interface ContributorAddRequestModel {
  attributes: {
    bibliographic: boolean;
    child_nodes?: string[];
    email?: string;
    full_name?: string;
    id?: string;
    index?: number;
    permission: string;
  };
  id?: string;
  relationships?: {
    users?: {
      data: Partial<JsonApiResourceRef<'users'>>;
    };
  };
  type: 'contributors';
}
