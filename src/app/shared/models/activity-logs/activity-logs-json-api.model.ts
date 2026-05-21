import { BaseNodeDataJsonApi } from '../nodes/base-node-data-json-api.model';
import { UserDataJsonApi } from '../user/user-json-api.model';

export interface ActivityLogJsonApi {
  id: string;
  type: string;
  attributes: {
    action: string;
    date: string;
    params: {
      contributors?: LogContributorJsonApi[];
      license?: string;
      tag?: string;
      institution?: {
        id: string;
        name: string;
      };
      params_node: {
        id: string;
        title: string;
      };
      params_project: null;
      pointer: PointerJsonApi | null;
      template_node?: {
        id: string;
        url: string;
        title: string;
      };
      preprint_provider?:
        | string
        | {
            url: string;
            name: string;
          }
        | null;
      addon?: string;
      anonymous_link?: boolean;
      file?: {
        name: string;
        url: string;
      };
      wiki?: {
        name: string;
        url: string;
      };
      destination?: {
        materialized: string;
        addon: string;
        url: string;
      };
      identifiers?: {
        doi?: string;
        ark?: string;
      };
      kind?: string;
      old_page?: string;
      page?: string;
      page_id?: string;
      path?: string;
      urls?: {
        view: string;
      };
      preprint?: string;
      source?: {
        materialized: string;
        addon: string;
      };
      title_new?: string;
      title_original?: string;
      updated_fields?: Record<
        string,
        {
          new: string;
          old: string;
        }
      >;
      value?: string;
      version?: string;
      github_user?: string;
    };
  };
  embeds?: {
    original_node?: {
      data: BaseNodeDataJsonApi;
    };
    user?: {
      data: UserDataJsonApi;
    };
    linked_node?: {
      data: BaseNodeDataJsonApi;
    };
  };
  meta: {
    total: number;
    anonymous: boolean;
  };
}

interface PointerJsonApi {
  category: string;
  id: string;
  title: string;
  url: string;
}

export interface LogContributorJsonApi {
  id: string;
  full_name: string;
  given_name: string;
  middle_names: string;
  family_name: string;
  unregistered_name: string | null;
  active: boolean;
}
