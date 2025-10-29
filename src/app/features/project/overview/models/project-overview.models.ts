import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { IdTypeModel } from '@shared/models/common/id-type.model';
import { JsonApiResponseWithMeta, MetaAnonymousJsonApi } from '@shared/models/common/json-api.model';
import { ContributorModel } from '@shared/models/contributors/contributor.model';
import { ContributorDataJsonApi } from '@shared/models/contributors/contributor-response-json-api.model';
import { Identifier } from '@shared/models/identifiers/identifier.model';
import { InstitutionsJsonApiResponse } from '@shared/models/institutions/institution-json-api.model';
import { Institution } from '@shared/models/institutions/institutions.models';
import { LicenseModel, LicensesOption } from '@shared/models/license/license.model';

export interface ProjectOverview {
  id: string;
  type: string;
  title: string;
  description: string;
  dateModified: string;
  dateCreated: string;
  isPublic: boolean;
  category: string;
  isRegistration: boolean;
  isPreprint: boolean;
  isFork: boolean;
  isCollection: boolean;
  tags: string[];
  accessRequestsEnabled: boolean;
  nodeLicense?: LicensesOption;
  license?: LicenseModel;
  doi?: string;
  publicationDoi?: string;
  storage?: {
    id: string;
    type: string;
    storageLimitStatus: string;
    storageUsage: string;
  };
  identifiers?: Identifier[];
  supplements?: ProjectSupplements[];
  analyticsKey: string;
  currentUserCanComment: boolean;
  currentUserPermissions: UserPermissions[];
  currentUserIsContributor: boolean;
  currentUserIsContributorOrGroupMember: boolean;
  wikiEnabled: boolean;
  contributors: ContributorModel[];
  customCitation: string | null;
  region?: IdTypeModel;
  affiliatedInstitutions?: Institution[];
  forksCount: number;
  viewOnlyLinksCount: number;
  links: {
    rootFolder: string;
    iri: string;
  };
  parentId?: string;
  rootParentId?: string;
}

export interface ProjectOverviewWithMeta {
  project: ProjectOverview;
  meta?: MetaAnonymousJsonApi;
}

export interface ProjectOverviewGetResponseJsonApi {
  id: string;
  type: string;
  attributes: {
    title: string;
    description: string;
    date_modified: string;
    date_created: string;
    public: boolean;
    category: string;
    registration: boolean;
    preprint: boolean;
    fork: boolean;
    collection: boolean;
    tags: string[];
    access_requests_enabled: boolean;
    node_license?: {
      copyright_holders: string[];
      year: string;
    };
    doi?: string;
    publication_doi?: string;
    analytics_key: string;
    current_user_can_comment: boolean;
    current_user_permissions: string[];
    current_user_is_contributor: boolean;
    current_user_is_contributor_or_group_member: boolean;
    wiki_enabled: boolean;
    custom_citation: string | null;
  };
  embeds: {
    affiliated_institutions: InstitutionsJsonApiResponse;
    identifiers: {
      data: {
        id: string;
        type: string;
        attributes: {
          category: string;
          value: string;
        };
      }[];
    };
    bibliographic_contributors: {
      data: ContributorDataJsonApi[];
    };
    license: {
      data: {
        id: string;
        type: string;
        attributes: {
          name: string;
          text: string;
          url: string;
        };
      };
    };
    preprints: {
      data: {
        id: string;
        type: string;
        attributes: {
          date_created: string;
          title: string;
        };
        links: {
          html: string;
        };
      }[];
    };
    storage: {
      data?: {
        id: string;
        type: string;
        attributes: {
          storage_limit_status: string;
          storage_usage: string;
        };
      };
      errors?: {
        detail: string;
      }[];
    };
  };
  relationships: {
    region?: {
      data: {
        id: string;
        type: string;
      };
    };
    forks: {
      links: {
        related: {
          meta: {
            count: number;
          };
        };
      };
    };
    view_only_links: {
      links: {
        related: {
          meta: {
            count: number;
          };
        };
      };
    };
    files: {
      links: {
        related: {
          href: string;
        };
      };
    };
    root?: {
      data: {
        id: string;
        type: string;
      };
    };
    parent?: {
      data: {
        id: string;
        type: string;
      };
    };
  };
  links: {
    iri: string;
  };
}

export interface ProjectOverviewResponseJsonApi
  extends JsonApiResponseWithMeta<ProjectOverviewGetResponseJsonApi, MetaAnonymousJsonApi, null> {
  data: ProjectOverviewGetResponseJsonApi;
  meta: MetaAnonymousJsonApi;
}

export interface ProjectSupplements {
  id: string;
  type: string;
  title: string;
  dateCreated: string;
  url: string;
}
