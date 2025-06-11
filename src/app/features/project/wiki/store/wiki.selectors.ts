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
    return state.projectWikiList.data;
  }

  @Selector([WikiState])
  static getWikiListLoading(state: WikiStateModel): boolean {
    return state.projectWikiList.isLoading;
  }

  @Selector([WikiState])
  static getComponentsWikiList(state: WikiStateModel): ComponentWiki[] {
    return state.projectComponentsWikiList.data;
  }

  @Selector([WikiState])
  static getComponentsWikiListLoading(state: WikiStateModel): boolean {
    return state.projectComponentsWikiList.isLoading;
  }

  @Selector([WikiState])
  static getCurrentContent(state: WikiStateModel): string {
    return state.currentContent;
  }

  @Selector([WikiState])
  static getWikiSubmitting(state: WikiStateModel): boolean {
    return state.projectWikiList.isSubmitting ?? false;
  }
}
