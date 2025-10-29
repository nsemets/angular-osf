import { ContributorModel } from '@osf/shared/models/contributors/contributor.model';
import { PaginatedData } from '@osf/shared/models/paginated-data.model';

import { ReviewAction } from './review-action.model';

export interface PreprintSubmissionPaginatedData extends PaginatedData<PreprintSubmissionModel[]> {
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
}

export interface PreprintSubmissionModel {
  id: string;
  title: string;
  reviewsState: string;
  public: boolean;
  actions: ReviewAction[];
  contributors: ContributorModel[];
  totalContributors: number;
  contributorsLoading?: boolean;
  contributorsPage?: number;
}
