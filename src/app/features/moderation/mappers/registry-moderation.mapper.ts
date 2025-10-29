import { UserMapper } from '@osf/shared/mappers/user';
import { PaginatedData } from '@osf/shared/models';

import {
  RegistryDataJsonApi,
  RegistryModeration,
  RegistryResponseJsonApi,
  ReviewAction,
  ReviewActionsDataJsonApi,
} from '../models';

export class RegistryModerationMapper {
  static fromResponse(response: RegistryDataJsonApi): RegistryModeration {
    return {
      id: response.id,
      title: response.attributes.title,
      reviewsState: response.attributes.reviews_state,
      revisionStatus: response.attributes.revision_state,
      public: response.attributes.public,
      embargoed: response.attributes.embargoed,
      embargoEndDate: response.attributes.embargo_end_date,
      actions: [],
      revisionId: response.embeds?.schema_responses?.data?.[0]?.id || null,
    };
  }

  static fromResponseWithPagination(response: RegistryResponseJsonApi): PaginatedData<RegistryModeration[]> {
    return {
      data: response.data.map((x) => this.fromResponse(x)),
      totalCount: response.meta.total,
      pageSize: response.meta.per_page,
    };
  }

  static fromActionResponse(response: ReviewActionsDataJsonApi): ReviewAction {
    const creator = UserMapper.getUserInfo(response.embeds?.creator);

    return {
      id: response.id,
      fromState: response.attributes.from_state,
      toState: response.attributes.to_state,
      dateModified: response.attributes.date_modified,
      comment: response.attributes.comment,
      creator: creator
        ? {
            id: creator?.id || '',
            name: creator?.fullName || '',
          }
        : null,
      trigger: response.attributes.trigger,
    };
  }
}
