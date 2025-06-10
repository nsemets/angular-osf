import {
  ComponentsWikiGetResponse,
  ComponentWiki,
  HomeWiki,
  HomeWikiGetResponse,
  Wiki,
  WikiGetResponse,
} from '../models';

export class WikiMapper {
  static fromGetHomeWikiResponse(response: HomeWikiGetResponse): HomeWiki {
    return {
      id: response.id,
      name: response.attributes.name,
      contentType: response.attributes.content_type,
      downloadLink: response.links.download,
    };
  }

  static fromGetWikiResponse(response: WikiGetResponse): Wiki {
    return {
      id: response.id,
      name: response.attributes.name,
      kind: response.attributes.kind, // Assuming content is part of the attributes
    };
  }

  static fromGetComponentsWikiResponse(response: ComponentsWikiGetResponse): ComponentWiki {
    return {
      id: response.id,
      title: response.attributes.title,
      list: response.embeds?.wikis?.data.map((wiki) => WikiMapper.fromGetWikiResponse(wiki)) || [],
    };
  }
}
