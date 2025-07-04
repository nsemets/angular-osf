import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponse, JsonApiResponseWithPaging, UserGetResponse } from '@osf/core/models';
import { JsonApiService } from '@osf/core/services';
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

@Injectable()
export class DraftRegistrationContributorsService implements IContributorsService {
  private apiUrl = environment.apiUrl;
  private readonly jsonApiService = inject(JsonApiService);

  getAllContributors(draftId: string): Observable<ContributorModel[]> {
    return this.jsonApiService
      .get<JsonApiResponse<ContributorResponse[], null>>(`${this.apiUrl}/draft_registrations/${draftId}/contributors/`)
      .pipe(map((contributors) => ContributorsMapper.fromResponse(contributors.data)));
  }

  searchUsers(value: string, page = 1): Observable<PaginatedData<ContributorAddModel[]>> {
    const baseUrl = `${environment.apiUrl}/users/?filter[full_name]=${value}&page=${page}`;

    return this.jsonApiService
      .get<JsonApiResponseWithPaging<UserGetResponse[], null>>(baseUrl)
      .pipe(map((response) => ContributorsMapper.fromUsersWithPaginationGetResponse(response)));
  }

  addContributor(draftId: string, data: ContributorAddModel): Observable<ContributorModel> {
    const baseUrl = `${this.apiUrl}/draft_registrations/${draftId}/contributors/`;
    const type = data.id ? AddContributorType.Registered : AddContributorType.Unregistered;

    const contributorData = { data: ContributorsMapper.toContributorAddRequest(data, type) };

    return this.jsonApiService
      .post<JsonApiResponse<ContributorResponse, null>>(baseUrl, contributorData)
      .pipe(map((contributor) => ContributorsMapper.fromContributorResponse(contributor.data)));
  }

  updateContributor(draftId: string, data: ContributorModel): Observable<ContributorModel> {
    const baseUrl = `${environment.apiUrl}/draft_registrations/${draftId}/contributors/${data.userId}`;

    const contributorData = { data: ContributorsMapper.toContributorAddRequest(data) };

    return this.jsonApiService
      .patch<ContributorResponse>(baseUrl, contributorData)
      .pipe(map((contributor) => ContributorsMapper.fromContributorResponse(contributor)));
  }

  deleteContributor(draftId: string, contributorId: string): Observable<void> {
    return this.jsonApiService.delete(`${this.apiUrl}/draft_registrations/${draftId}/contributors/${contributorId}`);
  }
}
