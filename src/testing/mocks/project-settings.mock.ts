import { ProjectSettingsModel } from '@osf/features/project/settings/models';

export const MOCK_PROJECT_SETTINGS: ProjectSettingsModel = {
  id: 'test-project-123',
  attributes: {
    accessRequestsEnabled: true,
    anyoneCanComment: false,
    anyoneCanEditWiki: false,
    wikiEnabled: false,
  },
};
