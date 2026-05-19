import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';

export function getDuplicatesForksResponse() {
  return {
    data: [
      {
        id: 'fork-1',
        type: 'nodes',
        attributes: {
          access_requests_enabled: false,
          analytics_key: '',
          category: 'project',
          collection: false,
          current_user_can_comment: false,
          current_user_is_contributor: true,
          current_user_is_contributor_or_group_member: true,
          current_user_permissions: [UserPermissions.Admin, UserPermissions.Write],
          custom_citation: '',
          date_created: '2024-01-01T00:00:00.000Z',
          date_modified: '2024-01-02T00:00:00.000Z',
          description: 'Fork description',
          fork: true,
          node_license: null,
          preprint: false,
          public: true,
          registration: false,
          tags: [],
          title: 'Fork Title',
          wiki_enabled: false,
        },
        links: {
          html: 'https://osf.io/fork-1',
          self: 'https://api.test/v2/nodes/fork-1/',
          iri: '',
        },
        relationships: {},
        embeds: {
          bibliographic_contributors: { data: [] },
        },
      },
    ],
    meta: { total: 1, per_page: 10, version: '2.0' },
    links: { self: '' },
  };
}
