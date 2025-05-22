import { ProjectSettingsModel } from '@osf/features/project/settings';

export const EMPTY_PROJECT_SETTINGS: ProjectSettingsModel = {
  attributes: {
    wikiEnabled: false,
    redirectLinkUrl: '',
    redirectLinkLabel: '',
    redirectLinkEnabled: false,
    anyoneCanEditWiki: false,
    anyoneCanComment: false,
    accessRequestsEnabled: false,
  },
  linkTable: [],
};
