import { ProjectSettingsModel, ProjectSettingsResponseModel } from '@osf/features/project/settings';

export class SettingsMapper {
  static fromResponse(response: ProjectSettingsResponseModel): ProjectSettingsModel {
    return {
      attributes: {
        accessRequestsEnabled: response.data.attributes.access_requests_enabled,
        anyoneCanComment: response.data.attributes.anyone_can_comment,
        anyoneCanEditWiki: response.data.attributes.anyone_can_edit_wiki,
        redirectLinkEnabled: response.data.attributes.redirect_link_enabled,
        redirectLinkLabel: response.data.attributes.redirect_link_label,
        redirectLinkUrl: response.data.attributes.redirect_link_url,
        wikiEnabled: response.data.attributes.wiki_enabled,
      },
      linkTable: response.data.relationships.view_only_links.links.private_links?.length
        ? response.data.relationships.view_only_links.links.private_links.map((links) => {
            return {
              anonymous: links.anonymous,
              link: links.name,
              createdDate: links.date_created,
              createdBy: links.creator,
              id: links.id,
              nodes: links.nodes,
            };
          })
        : [],
    } as ProjectSettingsModel;
  }
}
