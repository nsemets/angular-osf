import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { searchPreferencesToJsonApiQueryParams } from '@osf/shared/helpers/search-pref-to-json-api-query-params.helper';
import { JsonApiResponse, ResponseJsonApi } from '@osf/shared/models/common/json-api.model';
import { SearchFilters } from '@osf/shared/models/search-filters.model';
import { JsonApiService } from '@osf/shared/services/json-api.service';

import { meetingSortFieldMap, meetingSubmissionSortFieldMap } from '../constants';
import { MeetingsMapper } from '../mappers';
import {
  MeetingGetResponseJsonApi,
  MeetingSubmissionGetResponseJsonApi,
  MeetingSubmissionsWithPaging,
  MeetingsWithPaging,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MeetingsService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly environment = inject(ENVIRONMENT);

  get apiUrl() {
    return `${this.environment.apiDomainUrl}/_/meetings/`;
  }

  getAllMeetings(pageNumber: number, pageSize: number, filters: SearchFilters): Observable<MeetingsWithPaging> {
    const params: Record<string, unknown> = searchPreferencesToJsonApiQueryParams(
      {},
      pageNumber,
      pageSize,
      filters,
      meetingSortFieldMap
    );

    return this.jsonApiService
      .get<ResponseJsonApi<MeetingGetResponseJsonApi[]>>(this.apiUrl, params)
      .pipe(map((response) => MeetingsMapper.fromMeetingsGetResponse(response)));
  }

  getMeetingSubmissions(
    meetingId: string,
    pageNumber: number,
    pageSize: number,
    filters: SearchFilters
  ): Observable<MeetingSubmissionsWithPaging> {
    const params: Record<string, unknown> = searchPreferencesToJsonApiQueryParams(
      {},
      pageNumber,
      pageSize,
      filters,
      meetingSubmissionSortFieldMap
    );

    return this.jsonApiService
      .get<ResponseJsonApi<MeetingSubmissionGetResponseJsonApi[]>>(`${this.apiUrl}${meetingId}/submissions/`, params)
      .pipe(map((response) => MeetingsMapper.fromMeetingSubmissionGetResponse(response)));
  }

  getMeetingById(meetingId: string) {
    return this.jsonApiService
      .get<JsonApiResponse<MeetingGetResponseJsonApi, null>>(this.apiUrl + meetingId)
      .pipe(map((response) => MeetingsMapper.fromMeetingGetResponse(response.data)));
  }
}
