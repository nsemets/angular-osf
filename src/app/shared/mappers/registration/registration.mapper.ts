import { RegistryStatus } from '@osf/shared/enums/registry-status.enum';
import {
  DraftRegistrationDataJsonApi,
  DraftRegistrationModel,
  RegistrationCard,
  RegistrationDataJsonApi,
  RegistrationModel,
  SchemaResponse,
  SchemaResponseDataJsonApi,
} from '@osf/shared/models';

import { ContributorsMapper } from '../contributors';

import { MapRegistryStatus } from './map-registry-status.mapper';

export class RegistrationMapper {
  static fromDraftRegistrationResponse(response: DraftRegistrationDataJsonApi): DraftRegistrationModel {
    return {
      id: response.id,
      title: response.attributes.title,
      description: response.attributes.description,
      registrationSchemaId: response.relationships.registration_schema?.data?.id || '',
      license: {
        id: response.relationships.license?.data?.id || '',
        options: response.attributes.node_license
          ? {
              year: response.attributes.node_license.year,
              copyrightHolders: response.attributes.node_license.copyright_holders.join(','),
            }
          : null,
      },
      tags: response.attributes.tags || [],
      stepsData: response.attributes.registration_responses || {},
      branchedFrom: response.embeds?.branched_from?.data
        ? {
            id: response.embeds.branched_from.data.id,
            title: response.embeds.branched_from.data.attributes.title,
            filesLink: response.embeds?.branched_from?.data.relationships?.files?.links?.related?.href,
            type: response.embeds.branched_from.data.type,
          }
        : {
            id: response.relationships.branched_from?.data?.id || '',
            title: response.attributes.title,
            filesLink: response.relationships.branched_from?.links?.related.href + 'files/',
            type: response.relationships.branched_from?.data?.type,
          },
      providerId: response.relationships.provider?.data?.id || '',
      hasProject: !!response.attributes.has_project,
      components: [],
      currentUserPermissions: response.attributes.current_user_permissions,
    };
  }

  static fromRegistrationResponse(response: RegistrationDataJsonApi): RegistrationModel {
    return {
      id: response.id,
      type: 'registration',
    } as RegistrationModel;
  }

  static fromDraftToRegistrationCard(registration: DraftRegistrationDataJsonApi): RegistrationCard {
    return {
      id: registration.id,
      title: registration.attributes.title,
      description: registration.attributes.description || '',
      status: RegistryStatus.None,
      dateCreated: registration.attributes.datetime_initiated,
      dateModified: registration.attributes.datetime_updated,
      registrationTemplate: registration.embeds?.registration_schema?.data?.attributes?.name || '',
      registry: registration.embeds?.provider?.data?.attributes?.name || '',
      public: registration.attributes.public,
      contributors: ContributorsMapper.getContributors(registration.embeds?.bibliographic_contributors?.data),
      currentUserPermissions: registration.attributes.current_user_permissions,
    };
  }

  static fromRegistrationToRegistrationCard(registration: RegistrationDataJsonApi): RegistrationCard {
    return {
      id: registration.id,
      title: registration.attributes.title,
      description: registration.attributes.description || '',
      status: MapRegistryStatus(registration.attributes),
      dateCreated: registration.attributes.date_created,
      dateModified: registration.attributes.date_modified,
      registrationTemplate: registration.embeds?.registration_schema?.data?.attributes?.name || '',
      registry: registration.embeds?.provider?.data?.attributes?.name || '',
      public: registration.attributes.public,
      reviewsState: registration.attributes.reviews_state,
      revisionState: registration.attributes.revision_state,
      hasData: registration.attributes.has_data,
      hasAnalyticCode: registration.attributes.has_analytic_code,
      hasMaterials: registration.attributes.has_materials,
      hasPapers: registration.attributes.has_papers,
      hasSupplements: registration.attributes.has_supplements,
      contributors: ContributorsMapper.getContributors(registration?.embeds?.bibliographic_contributors?.data),
      rootParentId: registration.relationships.root?.data?.id,
      currentUserPermissions: registration.attributes.current_user_permissions,
    };
  }

  static toRegistrationPayload(
    draftId: string,
    embargoDate: string,
    providerId: string,
    projectId?: string,
    components?: string[]
  ) {
    return {
      data: {
        type: 'registrations',
        attributes: {
          embargo_end_date: embargoDate || null,
          draft_registration_id: draftId,
          included_node_ids: components,
        },
        relationships: {
          registered_from: projectId
            ? {
                data: {
                  type: 'nodes',
                  id: projectId,
                },
              }
            : undefined,

          provider: {
            data: {
              type: 'registration-providers',
              id: providerId,
            },
          },
        },
      },
    };
  }

  static fromSchemaResponse(response: SchemaResponseDataJsonApi): SchemaResponse {
    return {
      id: response.id,
      dateCreated: response.attributes.date_created,
      dateSubmitted: response.attributes.date_submitted,
      dateModified: response.attributes.date_modified,
      revisionJustification: response.attributes.revision_justification,
      revisionResponses: response.attributes.revision_responses,
      updatedResponseKeys: response.attributes.updated_response_keys,
      reviewsState: response.attributes.reviews_state,
      isPendingCurrentUserApproval: response.attributes.is_pending_current_user_approval,
      isOriginalResponse: response.attributes.is_original_response,
      registrationSchemaId: response.relationships.registration_schema?.data?.id || '',
      registrationId: response.relationships.registration?.data?.id || '',
      filesLink: response.embeds?.registration?.data.relationships.files.links.related.href || '',
    };
  }
}
