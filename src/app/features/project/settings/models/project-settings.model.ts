import { LinkTableModel } from '@osf/features/project/settings/models/link-table.model';

export interface ProjectSettingsModel {
  id: string;
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
  lastFetched?: number;
}
