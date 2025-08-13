import { JsonApiResponseWithPaging } from '@core/models';

import { DuplicateJsonApi, DuplicatesWithTotal } from 'src/app/shared/models/duplicates';

export class DuplicatesMapper {
  static fromDuplicatesJsonApiResponse(
    response: JsonApiResponseWithPaging<DuplicateJsonApi[], null>
  ): DuplicatesWithTotal {
    return {
      data: response.data.map((fork) => ({
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
      })),
      totalCount: response.links.meta.total,
    };
  }
}
