import { Selector } from '@ngxs/store';

import { Wiki } from '../models';

import { ComponentWiki, WikiModesStateModel, WikiStateModel } from './wiki.model';
import { WikiState } from './wiki.state';

export class WikiSelectors {
  @Selector([WikiState])
  static getHomeWikiContent(state: WikiStateModel): string {
    return state.homeWikiContent.data;
  }

  @Selector([WikiState])
  static getHomeWikiLoading(state: WikiStateModel): boolean {
    return state.homeWikiContent.isLoading;
  }

  @Selector([WikiState])
  static getWikiModes(state: WikiStateModel): WikiModesStateModel {
    return state.wikiModes;
  }

  @Selector([WikiState])
  static getWikiList(state: WikiStateModel): Wiki[] {
    return state.wikiData.list;
  }

  @Selector([WikiState])
  static getComponentsWikiList(state: WikiStateModel): ComponentWiki[] {
    return state.wikiData.componentsWiki;
  }

  @Selector([WikiState])
  static getWikiContent(state: WikiStateModel): string {
    return state.wikiData.content;
  }
}
