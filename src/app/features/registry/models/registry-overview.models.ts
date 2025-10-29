import { RegistrationReviewStates } from '@osf/shared/enums/registration-review-states.enum';
import { RegistryStatus } from '@osf/shared/enums/registry-status.enum';
import { RevisionReviewStates } from '@osf/shared/enums/revision-review-states.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import {
  ContributorModel,
  Identifier,
  IdTypeModel,
  LicenseModel,
  LicensesOption,
  MetaAnonymousJsonApi,
  ProviderShortInfoModel,
  RegistrationNodeModel,
  RegistrationResponses,
  SchemaResponse,
  SubjectModel,
} from '@osf/shared/models';

export interface RegistryOverview {
  id: string;
  type: string;
  isPublic: boolean;
  forksCount: number;
  title: string;
  description: string;
  dateModified: string;
  dateCreated: string;
  dateRegistered?: string;
  registrationType: string;
  doi: string;
  tags: string[];
  provider?: ProviderShortInfoModel;
  contributors: ContributorModel[];
  citation: string;
  category: string;
  isFork: boolean;
  accessRequestsEnabled: boolean;
  nodeLicense?: LicensesOption;
  license?: LicenseModel;
  licenseUrl?: string;
  identifiers?: Identifier[];
  analyticsKey: string;
  currentUserCanComment: boolean;
  currentUserPermissions: UserPermissions[];
  currentUserIsContributor: boolean;
  currentUserIsContributorOrGroupMember: boolean;
  wikiEnabled: boolean;
  region?: IdTypeModel;
  subjects?: SubjectModel[];
  customCitation: string;
  hasData: boolean;
  hasAnalyticCode: boolean;
  hasMaterials: boolean;
  hasPapers: boolean;
  hasSupplements: boolean;
  questions: RegistrationResponses;
  registrationSchemaLink: string;
  associatedProjectId: string;
  schemaResponses: SchemaResponse[];
  status: RegistryStatus;
  revisionStatus: RevisionReviewStates;
  reviewsState?: RegistrationReviewStates;
  archiving: boolean;
  embargoEndDate: string;
  withdrawn: boolean;
  withdrawalJustification?: string;
  dateWithdrawn: string | null;
  rootParentId: string | null;
  iaUrl: string | null;
}

export interface RegistrationOverviewModel extends RegistrationNodeModel {
  type: string;
  registrationSchemaLink: string;
  associatedProjectId: string;
  citation: string;
  provider?: ProviderShortInfoModel;
  contributors: ContributorModel[];
  license?: LicenseModel;
  identifiers?: Identifier[];
  schemaResponses: SchemaResponse[];
  status: RegistryStatus;
}

export interface RegistryOverviewWithMeta {
  registry: RegistryOverview | null;
  meta?: MetaAnonymousJsonApi;
}
