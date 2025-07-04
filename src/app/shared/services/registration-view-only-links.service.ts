import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponse } from '@core/models';
import { JsonApiService } from '@core/services';

import { ViewOnlyLinksMapper } from '../mappers';
import { NodeResponseModel } from '../models';
import {
  PaginatedViewOnlyLinksModel,
  ViewOnlyLinkJsonApi,
  ViewOnlyLinksResponseJsonApi,
} from '../models/view-only-links';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationViewOnlyLinksService {
  private readonly jsonApiService = inject(JsonApiService);

  getResourceById(resourceId: string): Observable<NodeResponseModel> {
    return this.jsonApiService.get(`${environment.apiUrl}/registrations/${resourceId}`);
  }

  getViewOnlyLinksData(resourceId: string): Observable<PaginatedViewOnlyLinksModel> {
    const params: Record<string, unknown> = { embed: 'creator' };

    return this.jsonApiService
      .get<ViewOnlyLinksResponseJsonApi>(`${environment.apiUrl}/registrations/${resourceId}/view_only_links`, params)
      .pipe(map((response) => ViewOnlyLinksMapper.fromResponse(response, resourceId)));
  }

  createViewOnlyLink(resourceId: string, payload: ViewOnlyLinkJsonApi): Observable<PaginatedViewOnlyLinksModel> {
    const data = { data: { ...payload } };
    const params: Record<string, unknown> = { embed: 'creator' };

    return this.jsonApiService
      .post<
        JsonApiResponse<ViewOnlyLinkJsonApi, null>
      >(`${environment.apiUrl}/registrations/${resourceId}/view_only_links/`, data, params)
      .pipe(map((response) => ViewOnlyLinksMapper.fromSingleResponse(response.data, resourceId)));
  }

  deleteLink(resourceId: string, linkId: string): Observable<void> {
    return this.jsonApiService.delete(`${environment.apiUrl}/registrations/${resourceId}/view_only_links/${linkId}`);
  }
}
