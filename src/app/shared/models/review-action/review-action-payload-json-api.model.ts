import { ReviewActionTrigger } from '@osf/shared/enums/trigger-action.enum';

import { JsonApiResourceRef } from '../common/json-api/resource.model';

export interface ReviewActionPayloadJsonApi<TActionType extends string, TTargetType extends string> {
  data: {
    type: TActionType;
    attributes: ReviewActionPayloadAttributesJsonApi;
    relationships: ReviewActionPayloadRelationshipsJsonApi<TTargetType>;
  };
}

interface ReviewActionPayloadAttributesJsonApi {
  comment: string;
  trigger: ReviewActionTrigger | string;
}

interface ReviewActionPayloadRelationshipsJsonApi<TTargetType extends string> {
  target: {
    data: JsonApiResourceRef<TTargetType>;
  };
}
