import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@core/services/json-api/json-api.service';
import { PaginatedViewOnlyLinksModel, ViewOnlyLink } from '@osf/features/project/settings';
import { ViewOnlyLinksMapper } from '@osf/features/project/settings/mappers/view-only-links.mapper';
import { ViewOnlyLinksResponseModel } from '@osf/features/project/settings/models/view-only-link-response.model';

import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ViewOnlyLinksService {
  private readonly jsonApiService = inject(JsonApiService);

  getViewOnlyLinksData(projectId: string): Observable<PaginatedViewOnlyLinksModel> {
    return this.jsonApiService
      .get<ViewOnlyLinksResponseModel>(`${environment.apiUrl}/nodes/${projectId}/view_only_links`)
      .pipe(map((response) => ViewOnlyLinksMapper.fromResponse(response, projectId)));
  }

  createViewOnlyLink(projectId: string, payload: ViewOnlyLink): Observable<PaginatedViewOnlyLinksModel> {
    return this.jsonApiService
      .post<ViewOnlyLinksResponseModel>(`${environment.apiUrl}/nodes/${projectId}/view_only_links`, {
        data: { ...payload },
      })
      .pipe(map((response) => ViewOnlyLinksMapper.fromResponse(response, projectId)));
  }

  deleteLink(projectId: string, linkId: string): Observable<void> {
    return this.jsonApiService.delete(`${environment.apiUrl}/nodes/${projectId}/view_only_links/${linkId}`);
  }
}
