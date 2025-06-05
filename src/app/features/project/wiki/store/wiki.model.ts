import { AsyncStateModel } from '@osf/shared/models';

export interface WikiModesStateModel {
  view: boolean;
  edit: boolean;
  compare: boolean;
}

export interface WikiStateModel {
  homeWikiContent: AsyncStateModel<string>;
  wikiModes: WikiModesStateModel;
  wikiData: {
    list: string[];
    version: string;
    content: string;
    isLoading: boolean;
    error: string | null;
  };
}
