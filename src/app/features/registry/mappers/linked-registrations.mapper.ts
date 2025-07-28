import { LinkedRegistration, LinkedRegistrationJsonApi } from '../models';

export class LinkedRegistrationsMapper {
  static fromApiResponse(apiRegistration: LinkedRegistrationJsonApi): LinkedRegistration {
    return {
      id: apiRegistration.id,
      title: apiRegistration.attributes.title,
      description: apiRegistration.attributes.description,
      category: apiRegistration.attributes.category,
      dateCreated: apiRegistration.attributes.date_created,
      dateModified: apiRegistration.attributes.date_modified,
      dateRegistered: apiRegistration.attributes.date_registered,
      tags: apiRegistration.attributes.tags || [],
      isPublic: apiRegistration.attributes.public,
      htmlUrl: apiRegistration.links.html,
      apiUrl: apiRegistration.links.self,
    };
  }
}
