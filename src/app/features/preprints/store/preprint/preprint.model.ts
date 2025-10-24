import { ReviewAction } from '@osf/features/moderation/models';
import { AsyncStateModel, AsyncStateWithTotalCount, FileModel, FileVersionModel } from '@shared/models';

import { PreprintModel, PreprintRequest, PreprintRequestAction, PreprintShortInfo } from '../../models';

export interface PreprintStateModel {
  myPreprints: AsyncStateWithTotalCount<PreprintShortInfo[]>;
  preprint: AsyncStateModel<PreprintModel | null>;
  preprintFile: AsyncStateModel<FileModel | null>;
  fileVersions: AsyncStateModel<FileVersionModel[]>;
  preprintVersionIds: AsyncStateModel<string[]>;
  preprintReviewActions: AsyncStateModel<ReviewAction[]>;
  preprintRequests: AsyncStateModel<PreprintRequest[]>;
  preprintRequestsActions: AsyncStateModel<PreprintRequestAction[]>;
}

export const DefaultState: PreprintStateModel = {
  preprint: {
    data: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
  },
  myPreprints: {
    data: [],
    isLoading: false,
    error: null,
    totalCount: 0,
  },
  preprintFile: {
    data: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
  },
  fileVersions: {
    data: [],
    isLoading: false,
    error: null,
  },
  preprintVersionIds: {
    data: [],
    isLoading: false,
    error: null,
  },
  preprintReviewActions: {
    data: [],
    isLoading: false,
    error: null,
  },
  preprintRequests: {
    data: [],
    isLoading: false,
    error: null,
  },
  preprintRequestsActions: {
    data: [],
    isLoading: false,
    error: null,
  },
};
