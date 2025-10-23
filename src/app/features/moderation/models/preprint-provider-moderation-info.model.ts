import { ReviewPermissions } from '@osf/shared/enums';

export interface PreprintProviderModerationInfo {
  id: string;
  name: string;
  permissions: ReviewPermissions[];
  reviewsCommentsAnonymous: boolean;
  reviewsCommentsPrivate: boolean;
  reviewsWorkflow: string;
  submissionCount?: number;
  supportEmail: string | null;
}
