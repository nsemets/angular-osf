import { Fork, ForkJsonApi } from '@shared/models/forks';

export class ForksMapper {
  static fromForksJsonApiResponse(response: ForkJsonApi[]): Fork[] {
    return response.map((fork) => ({
      id: fork.id,
      type: fork.type,
      title: fork.attributes.title,
      description: fork.attributes.description,
      dateCreated: fork.attributes.forked_date,
      dateModified: fork.attributes.date_modified,
      public: fork.attributes.public,
      currentUserPermissions: fork.attributes.current_user_permissions,
      contributors: fork.embeds.bibliographic_contributors.data.map((contributor) => ({
        familyName: contributor.embeds.users.data.attributes.family_name,
        fullName: contributor.embeds.users.data.attributes.full_name,
        givenName: contributor.embeds.users.data.attributes.given_name,
        middleName: contributor.embeds.users.data.attributes.middle_name,
        id: contributor.embeds.users.data.id,
        type: contributor.embeds.users.data.type,
      })),
    }));
  }
}
