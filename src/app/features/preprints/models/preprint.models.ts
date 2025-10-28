import { UserPermissions } from '@osf/shared/enums';
import { BooleanOrNull, StringOrNull } from '@osf/shared/helpers';
import { Identifier, IdName, LicenseModel, LicenseOptions } from '@osf/shared/models';

import { ApplicabilityStatus, PreregLinkInfo, ReviewsState } from '../enums';

export interface PreprintModel {
  id: string;
  dateCreated: string;
  dateModified: string;
  dateWithdrawn: Date | null;
  datePublished: Date | null;
  dateLastTransitioned: Date | null;
  title: string;
  description: string;
  reviewsState: ReviewsState;
  preprintDoiCreated: Date | null;
  currentUserPermissions: UserPermissions[];
  doi: StringOrNull;
  originalPublicationDate: Date | null;
  customPublicationCitation: StringOrNull;
  isPublished: boolean;
  tags: string[];
  isPublic: boolean;
  version: number;
  isLatestVersion: boolean;
  isPreprintOrphan: boolean;
  withdrawalJustification: StringOrNull;
  nodeId: StringOrNull;
  primaryFileId: StringOrNull;
  licenseId: StringOrNull;
  licenseOptions: LicenseOptions | null;
  hasCoi: BooleanOrNull;
  coiStatement: StringOrNull;
  hasDataLinks: ApplicabilityStatus | null;
  dataLinks: string[];
  whyNoData: StringOrNull;
  hasPreregLinks: ApplicabilityStatus | null;
  whyNoPrereg: StringOrNull;
  preregLinks: string[];
  preregLinkInfo: PreregLinkInfo | null;
  metrics?: PreprintMetrics;
  embeddedLicense: LicenseModel | null;
  preprintDoiLink?: string;
  articleDoiLink?: string;
  identifiers?: Identifier[];
}

export interface PreprintFilesLinks {
  uploadFileLink: string;
}

export interface PreprintShortInfo {
  id: string;
  title: string;
  dateModified: string;
  contributors: IdName[];
  providerId: string;
}

export interface PreprintShortInfoWithTotalCount {
  data: PreprintShortInfo[];
  totalCount: number;
}

export interface PreprintMetrics {
  downloads: number;
  views: number;
}
