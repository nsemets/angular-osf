import { CurrentResourceType } from '@osf/shared/enums/resource-type.enum';
import { ReviewPermissions } from '@osf/shared/enums/review-permissions.enum';

export interface ProviderShortInfoModel {
  id: string;
  name: string;
  type: CurrentResourceType;
  permissions?: ReviewPermissions[];
  reviewsWorkflow?: string;
}

export interface BaseProviderModel {
  id: string;
  type: string;
  advisoryBoard: string;
  allowCommenting: boolean;
  allowSubmissions: boolean;
  description: string;
  domain: string;
  domainRedirectEnabled: boolean;
  emailSupport: string | null;
  example: string | null;
  facebookAppId: string | null;
  footerLinks: string;
  name: string;
  permissions: ReviewPermissions[];
  reviewsWorkflow: string;
  sharePublishType: string;
  shareSource: string;
}
