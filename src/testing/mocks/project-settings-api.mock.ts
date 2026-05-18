import { ProjectSettingsDataJsonApi, ProjectSettingsResponseJsonApi } from '@osf/features/project/settings/models';
import { SubscriptionEvent } from '@osf/shared/enums/subscriptions/subscription-event.enum';
import { SubscriptionFrequency } from '@osf/shared/enums/subscriptions/subscription-frequency.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { BaseNodeDataJsonApi } from '@osf/shared/models/nodes/base-node-data-json-api.model';
import { NotificationSubscriptionGetResponseJsonApi } from '@osf/shared/models/notifications/notification-subscription-json-api.model';

export const MOCK_PROJECT_ID = 'test-project-123';

export const MOCK_PROJECT_SETTINGS_API_RESPONSE: ProjectSettingsResponseJsonApi = {
  data: {
    id: 'settings-id',
    type: 'node-settings',
    attributes: {
      access_requests_enabled: true,
      anyone_can_edit_wiki: false,
      wiki_enabled: true,
    },
    relationships: {
      view_only_links: {
        links: {
          related: { href: 'https://api.test/links', meta: {} },
        },
      },
    },
    links: {
      self: 'https://api.test/settings',
      iri: 'https://api.test/settings-iri',
    },
  },
  meta: { version: '2.20' },
};

export const MOCK_PROJECT_SETTINGS_PATCH_DATA: ProjectSettingsDataJsonApi = {
  id: MOCK_PROJECT_ID,
  type: 'node-settings',
  attributes: {
    access_requests_enabled: false,
    anyone_can_edit_wiki: true,
    wiki_enabled: false,
  },
  relationships: MOCK_PROJECT_SETTINGS_API_RESPONSE.data.relationships,
  links: MOCK_PROJECT_SETTINGS_API_RESPONSE.data.links,
};

export const MOCK_NOTIFICATION_SUBSCRIPTION_API: NotificationSubscriptionGetResponseJsonApi = {
  id: `${MOCK_PROJECT_ID}_file_updated`,
  type: 'subscription',
  attributes: {
    event_name: SubscriptionEvent.FileUpdated,
    frequency: SubscriptionFrequency.Instant,
  },
};

export const MOCK_NODE_DATA_JSON_API = {
  id: MOCK_PROJECT_ID,
  type: 'nodes',
  attributes: {
    title: 'Test Project',
    description: 'Test Description',
    public: true,
    current_user_permissions: [UserPermissions.Admin, UserPermissions.Write, UserPermissions.Read],
    access_requests_enabled: true,
    analytics_key: 'key',
    category: 'project',
    collection: false,
    current_user_can_comment: false,
    current_user_is_contributor: true,
    current_user_is_contributor_or_group_member: true,
    custom_citation: '',
    date_created: '2024-01-01T00:00:00.000Z',
    date_modified: '2024-01-02T00:00:00.000Z',
    fork: false,
    node_license: null,
    preprint: false,
    registration: false,
    tags: [],
    wiki_enabled: true,
  },
  links: { html: 'https://osf.test/html', self: 'https://api.test/nodes', iri: 'https://api.test/iri' },
  relationships: {
    root: { data: { id: 'root-project-id', type: 'nodes' }, links: { related: { href: '' } } },
  },
  embeds: {
    region: {
      data: {
        id: 'us-east-1',
        type: 'regions',
        attributes: { name: 'US East' },
        links: { self: 'https://api.test/regions' },
      },
    },
    affiliated_institutions: { data: [] },
  },
} as BaseNodeDataJsonApi;
