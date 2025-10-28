import { ReviewAction } from '@osf/features/moderation/models';
import { AsyncStateModel, FileModel, FileVersionModel } from '@shared/models';

import { PreprintMetrics, PreprintModel, PreprintRequest, PreprintRequestAction } from '../../models';

export interface PreprintStateModel {
  preprint: AsyncStateModel<PreprintModel | null>;
  preprintFile: AsyncStateModel<FileModel | null>;
  fileVersions: AsyncStateModel<FileVersionModel[]>;
  preprintVersionIds: AsyncStateModel<string[]>;
  preprintReviewActions: AsyncStateModel<ReviewAction[]>;
  preprintRequests: AsyncStateModel<PreprintRequest[]>;
  preprintRequestsActions: AsyncStateModel<PreprintRequestAction[]>;
  metrics: AsyncStateModel<PreprintMetrics | null>;
}

export const DefaultState: PreprintStateModel = {
  preprint: {
    data: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
  },
  metrics: {
    data: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
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
