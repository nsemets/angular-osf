import { ResponseJsonApi } from '@osf/shared/models/common/json-api.model';
import { PaginatedData } from '@osf/shared/models/paginated-data.model';
import { UserDataJsonApi } from '@osf/shared/models/user/user-json-api.model';

import { AddModeratorType, ModeratorPermission } from '../enums';
import { ModeratorAddModel, ModeratorAddRequestModel, ModeratorDataJsonApi, ModeratorModel } from '../models';

export class ModerationMapper {
  static getModerators(data: ModeratorDataJsonApi[]): ModeratorModel[] {
    if (!data?.length) {
      return [];
    }

    return data.map((moderator) => this.fromModeratorResponse(moderator));
  }

  static fromModeratorResponse(response: ModeratorDataJsonApi): ModeratorModel {
    return {
      id: response.id,
      userId: response.embeds.user.data.id,
      fullName: response.attributes.full_name,
      permission: response.attributes.permission_group as ModeratorPermission,
      employment: response.embeds.user.data.attributes.employment || [],
      education: response.embeds.user.data.attributes.education || [],
    };
  }

  static fromUsersWithPaginationGetResponse(
    response: ResponseJsonApi<UserDataJsonApi[]>
  ): PaginatedData<ModeratorAddModel[]> {
    return {
      data: response.data.map(
        (user) =>
          ({
            id: user.id,
            fullName: user.attributes.full_name,
            permission: ModeratorPermission.Moderator,
          }) as ModeratorAddModel
      ),
      totalCount: response.meta.total,
      pageSize: response.meta.per_page,
    };
  }

  static toModeratorAddRequest(model: ModeratorAddModel, type = AddModeratorType.Search): ModeratorAddRequestModel {
    if (type === AddModeratorType.Search) {
      return {
        type: 'moderators',
        attributes: {
          id: model.id,
          permission_group: model.permission,
        },
      };
    } else {
      return {
        type: 'moderators',
        attributes: {
          permission_group: model.permission,
          full_name: model.fullName,
          email: model.email,
        },
      };
    }
  }
}
