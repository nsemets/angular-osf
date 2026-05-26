import { JsonApiResource, JsonApiResourceRef } from '@osf/shared/models/common/json-api/resource.model';
import { RelationshipLinks } from '@shared/models/common/json-api/links.model';
import { ItemResponse } from '@shared/models/common/json-api/responses.model';
import { RegistrationNodeAttributesJsonApi } from '@shared/models/registration/registration-node-json-api.model';

export type RegistrationOverviewResponse = ItemResponse<RegistrationOverviewDataJsonApi>;

export interface RegistrationOverviewDataJsonApi extends JsonApiResource<
  'registrations',
  RegistrationNodeAttributesJsonApi
> {
  relationships: RegistryOverviewRelationshipsJsonApi;
}

interface RegistryOverviewRelationshipsJsonApi {
  license: {
    data: JsonApiResourceRef<'licenses'>;
  };
  provider: {
    data: JsonApiResourceRef<'registration-providers'>;
  };
  registered_from: {
    data: JsonApiResourceRef<'nodes'>;
  };
  registration_schema: {
    links: RelationshipLinks;
  };
  root: {
    data: JsonApiResourceRef<'registrations'>;
  };
}
