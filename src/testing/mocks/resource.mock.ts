import { ResourceInfoModel } from '@osf/features/contributors/models';
import { ResourceType } from '@shared/enums/resource-type.enum';
import { ResourceOverview } from '@shared/models/resource-overview.model';
import { ResourceModel } from '@shared/models/search/resource.model';

export const MOCK_RESOURCE: ResourceModel = {
  absoluteUrl: 'https://api.osf.io/v2/resources/resource-123',
  resourceType: ResourceType.Registration,
  title: 'Test Resource',
  description: 'This is a test resource',
  dateCreated: new Date('2024-01-15'),
  dateModified: new Date('2024-01-20'),
  creators: [
    { absoluteUrl: 'https://api.osf.io/v2/users/user1', name: 'John Doe', affiliationsAbsoluteUrl: [] },
    { absoluteUrl: 'https://api.osf.io/v2/users/user2', name: 'Jane Smith', affiliationsAbsoluteUrl: [] },
  ],
  provider: { absoluteUrl: 'https://api.osf.io/v2/providers/provider1', name: 'Test Provider' },
  license: { absoluteUrl: 'https://api.osf.io/v2/licenses/license1', name: 'MIT License' },
  registrationTemplate: 'Test Template',
  identifiers: ['https://staging4.osf.io/a42ysd'],
  doi: ['10.1234/abcd.5678'],
  addons: ['github', 'dropbox'],
  hasDataResource: 'true',
  hasAnalyticCodeResource: false,
  hasMaterialsResource: true,
  hasPapersResource: false,
  hasSupplementalResource: true,
  language: 'en',
  isPartOfCollection: { absoluteUrl: 'https://staging4.osf.io/123asd', name: 'collection' },
  funders: [
    {
      absoluteUrl: 'https://funder.org/nasa/',
      name: 'NASA',
    },
  ],
  affiliations: [{ absoluteUrl: 'https://university.edu/', name: 'Example University' }],
  qualifiedAttribution: [
    {
      agentId: 'agentId',
      order: 1,
      hadRole: '',
    },
  ],
  context: '',
};

export const MOCK_AGENT_RESOURCE: ResourceModel = {
  absoluteUrl: 'https://api.osf.io/v2/users/user-123',
  resourceType: ResourceType.Agent,
  title: 'Test User',
  description: 'This is a test user',
  dateCreated: new Date('2024-01-15'),
  dateModified: new Date('2024-01-20'),
  creators: [],
  hasDataResource: 'false',
  hasAnalyticCodeResource: false,
  hasMaterialsResource: false,
  hasPapersResource: false,
  hasSupplementalResource: false,
  identifiers: ['https://staging4.osf.io/123xca'],
  language: 'en',
  isPartOfCollection: { absoluteUrl: 'https://staging4.osf.io/123asd', name: 'collection' },
  doi: ['10.1234/abcd.5678'],
  addons: ['github', 'dropbox'],
  funders: [
    {
      absoluteUrl: 'https://funder.org/nasa/',
      name: 'NASA',
    },
  ],
  affiliations: [{ absoluteUrl: 'https://university.edu/', name: 'Example University' }],
  qualifiedAttribution: [
    {
      agentId: 'agentId',
      order: 1,
      hadRole: '',
    },
  ],
  context: '',
};

export const MOCK_RESOURCE_OVERVIEW: ResourceOverview = {
  id: 'resource-123',
  type: 'project',
  title: 'Test Resource',
  description: 'This is a test resource',
  dateModified: '2024-01-20T10:00:00Z',
  dateCreated: '2024-01-15T10:00:00Z',
  isPublic: true,
  category: 'project',
  isRegistration: false,
  isPreprint: false,
  isFork: false,
  isCollection: false,
  tags: ['test', 'example'],
  accessRequestsEnabled: false,
  analyticsKey: 'test-key',
  currentUserCanComment: true,
  currentUserPermissions: ['read', 'write'],
  currentUserIsContributor: true,
  currentUserIsContributorOrGroupMember: true,
  wikiEnabled: true,
  subjects: [],
  contributors: [],
  customCitation: 'Custom citation text',
  forksCount: 0,
};

export const MOCK_RESOURCE_INFO: ResourceInfoModel = {
  id: 'project-123',
  title: 'Test Project',
  type: ResourceType.Project,
  rootParentId: 'root-123',
};

export const MOCK_RESOURCE_WITH_CHILDREN = [
  { id: 'project-123', title: 'Test Project', parentId: null },
  { id: 'component-1', title: 'Component 1', parentId: 'project-123' },
  { id: 'component-2', title: 'Component 2', parentId: 'project-123' },
  { id: 'component-3', title: 'Component 3', parentId: 'component-1' },
];
