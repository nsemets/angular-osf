import { LinkTableModel } from '@osf/features/project/settings';

export interface ProjectSettingsModel {
  attributes: {
    accessRequestsEnabled: boolean;
    anyoneCanComment: boolean;
    anyoneCanEditWiki: boolean;
    redirectLinkEnabled: boolean;
    redirectLinkLabel: string;
    redirectLinkUrl: string;
    wikiEnabled: boolean;
  };
  linkTable: LinkTableModel[];
}
