import { ApiData, MetaJsonApi, PaginationLinksJsonApi } from '@osf/core/models';

export interface RegistrationResponseJsonApi {
  data: RegistrationDataJsonApi;
  meta: MetaJsonApi;
  links: PaginationLinksJsonApi;
}

export type RegistrationDataJsonApi = ApiData<RegistrationAttributesJsonApi, null, null, null>;

interface RegistrationAttributesJsonApi {
  category: string;
  current_user_permissions: string[];
  date_created: string;
  datetime_updated: string;
  description: string;
  has_project: boolean;
  node_license: string | null;
  registration_metadata: Record<string, unknown>;
  registration_responses: Record<string, unknown>;
  tags: string[];
  title: string;
}
