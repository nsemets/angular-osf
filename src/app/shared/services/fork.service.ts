import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponseWithPaging } from '@core/models';
import { JsonApiService } from '@core/services';
import { ForksMapper } from '@shared/mappers';
import { Fork, ForkJsonApi } from '@shared/models/forks';

import { environment } from '../../../environments/environment';

export interface ForksWithPagination {
  data: Fork[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ForkService {
  private jsonApiService = inject(JsonApiService);

  fetchAllForks(
    resourceId: string,
    resourceType: string,
    pageNumber?: number,
    pageSize?: number
  ): Observable<ForksWithPagination> {
    const params: Record<string, unknown> = {
      embed: 'bibliographic_contributors',
      'fields[users]': 'family_name,full_name,given_name,middle_name',
    };

    if (pageNumber) {
      params['page'] = pageNumber;
    }

    if (pageSize) {
      params['page[size]'] = pageSize;
    }

    return this.jsonApiService
      .get<
        JsonApiResponseWithPaging<ForkJsonApi[], null>
      >(`${environment.apiUrl}/${resourceType}/${resourceId}/forks/`, params)
      .pipe(
        map((res) => {
          return {
            data: ForksMapper.fromForksJsonApiResponse(res.data),
            totalCount: res.links.meta.total,
          };
        })
      );
  }
}
