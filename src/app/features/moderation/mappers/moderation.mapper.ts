import { Moderator, ModeratorDataJsonApi } from '../models';

export class ModerationMapper {
  static fromModeratorResponse(response: ModeratorDataJsonApi): Moderator {
    return {
      id: response.id,
      userId: response.embeds.user.id,
      fullName: response.attributes.full_name,
      permission: response.attributes.permission_group,
      employment: response.embeds.user.attributes.employment || [],
      education: response.embeds.user.attributes.education || [],
    };
  }
}
