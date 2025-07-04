import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponse, JsonApiResponseWithPaging, UserGetResponse } from '@core/models';
import { JsonApiService } from '@core/services';
import { AddContributorType } from '@osf/shared/enums';
import { ContributorsMapper } from '@osf/shared/mappers';
import {
  ContributorAddModel,
  ContributorModel,
  ContributorResponse,
  IContributorsService,
  PaginatedData,
} from '@osf/shared/models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PreprintContributorsService implements IContributorsService {
  private jsonApiService = inject(JsonApiService);
  private apiUrl = environment.apiUrl;

  getAllContributors(preprintId: string): Observable<ContributorModel[]> {
    return this.jsonApiService
      .get<JsonApiResponse<ContributorResponse[], null>>(`${this.apiUrl}/preprints/${preprintId}/contributors/`)
      .pipe(map((contributors) => ContributorsMapper.fromResponse(contributors.data)));
  }

  searchUsers(value: string, page = 1): Observable<PaginatedData<ContributorAddModel[]>> {
    const baseUrl = `${environment.apiUrl}/users/?filter[full_name]=${value}&page=${page}`;

    return this.jsonApiService
      .get<JsonApiResponseWithPaging<UserGetResponse[], null>>(baseUrl)
      .pipe(map((response) => ContributorsMapper.fromUsersWithPaginationGetResponse(response)));
  }

  addContributor(preprintId: string, data: ContributorAddModel): Observable<ContributorModel> {
    const baseUrl = `${this.apiUrl}/preprints/${preprintId}/contributors/`;
    const type = data.id ? AddContributorType.Registered : AddContributorType.Unregistered;

    const contributorData = { data: ContributorsMapper.toContributorAddRequest(data, type) };

    return this.jsonApiService
      .post<JsonApiResponse<ContributorResponse, null>>(baseUrl, contributorData)
      .pipe(map((contributor) => ContributorsMapper.fromContributorResponse(contributor.data)));
  }

  updateContributor(preprintId: string, data: ContributorModel): Observable<ContributorModel> {
    const baseUrl = `${environment.apiUrl}/preprints/${preprintId}/contributors/${data.userId}`;

    const contributorData = { data: ContributorsMapper.toContributorAddRequest(data) };

    return this.jsonApiService
      .patch<ContributorResponse>(baseUrl, contributorData)
      .pipe(map((contributor) => ContributorsMapper.fromContributorResponse(contributor)));
  }

  deleteContributor(preprintId: string, contributorId: string): Observable<void> {
    return this.jsonApiService.delete(`${this.apiUrl}/preprints/${preprintId}/contributors/${contributorId}`);
  }
}
