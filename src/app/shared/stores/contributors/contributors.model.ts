import { DEFAULT_TABLE_PARAMS } from '@osf/shared/constants';
import { ContributorAddModel, ContributorModel, RequestAccessModel } from '@osf/shared/models';
import { AsyncStateModel, AsyncStateWithTotalCount } from '@osf/shared/models/store';

export interface ContributorsList extends AsyncStateWithTotalCount<ContributorModel[]> {
  page: number;
  pageSize: number;
}

export interface ContributorsListWithFiltersModel extends ContributorsList {
  searchValue: string | null;
  permissionFilter: string | null;
  bibliographyFilter: boolean | null;
  isLoadingMore: boolean;
}

export interface ContributorsStateModel {
  contributorsList: ContributorsListWithFiltersModel;
  bibliographicContributorsList: ContributorsList;
  requestAccessList: AsyncStateModel<RequestAccessModel[]>;
  users: AsyncStateWithTotalCount<ContributorAddModel[]>;
}

export const CONTRIBUTORS_STATE_DEFAULTS: ContributorsStateModel = {
  contributorsList: {
    data: [],
    isLoading: false,
    error: '',
    searchValue: null,
    permissionFilter: null,
    bibliographyFilter: null,
    totalCount: 0,
    page: 1,
    pageSize: DEFAULT_TABLE_PARAMS.rows,
    isLoadingMore: false,
  },
  bibliographicContributorsList: {
    data: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    totalCount: 0,
    page: 0,
    pageSize: DEFAULT_TABLE_PARAMS.rows,
  },
  requestAccessList: {
    data: [],
    isLoading: false,
    error: null,
  },
  users: {
    data: [],
    isLoading: false,
    error: null,
    totalCount: 0,
  },
};
