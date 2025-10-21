import { AsyncStateModel, AsyncStateWithTotalCount, BaseNodeModel, ComponentOverview } from '@osf/shared/models';

import { ProjectOverview } from '../models';

export interface ProjectOverviewStateModel {
  project: AsyncStateModel<ProjectOverview | null>;
  components: AsyncStateWithTotalCount<ComponentOverview[]> & {
    currentPage: number;
  };
  isAnonymous: boolean;
  duplicatedProject: BaseNodeModel | null;
  parentProject: AsyncStateModel<ProjectOverview | null>;
}

export const PROJECT_OVERVIEW_DEFAULTS: ProjectOverviewStateModel = {
  project: {
    data: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
  },
  components: {
    data: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    currentPage: 0,
    totalCount: 0,
  },
  isAnonymous: false,
  duplicatedProject: null,
  parentProject: {
    data: null,
    isLoading: false,
    error: null,
  },
};
