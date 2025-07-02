import { Observable } from 'rxjs';

import { PaginatedData } from '@osf/shared/models';

import { ContributorModel } from './contributor.model';
import { ContributorAddModel } from './contributor-add.model';

export interface IContributorsService {
  getAllContributors(resourceId: string): Observable<ContributorModel[]>;
  addContributor(resourceId: string, data: ContributorAddModel): Observable<ContributorModel>;
  updateContributor(resourceId: string, data: ContributorModel): Observable<ContributorModel>;
  deleteContributor(resourceId: string, userId: string): Observable<void>;
  searchUsers(value: string, page: number): Observable<PaginatedData<ContributorAddModel[]>>;
}
