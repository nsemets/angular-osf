import { ModeratorPermission } from '../enums';
import { Moderator, ModeratorDataJsonApi } from '../models';

export class ModerationMapper {
  static fromModeratorResponse(response: ModeratorDataJsonApi): Moderator {
    return {
      id: response.id,
      userId: response.embeds.user.data.id,
      fullName: response.attributes.full_name,
      permission: response.attributes.permission_group as ModeratorPermission,
      employment: response.embeds.user.data.attributes.employment || [],
      education: response.embeds.user.data.attributes.education || [],
    };
  }
}
