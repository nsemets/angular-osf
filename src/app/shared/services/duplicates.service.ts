import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponseWithPaging } from '@core/models';
import { JsonApiService } from '@core/services';
import { DuplicatesMapper } from '@shared/mappers';

import { DuplicateJsonApi, DuplicatesWithTotal } from 'src/app/shared/models/duplicates';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DuplicatesService {
  private jsonApiService = inject(JsonApiService);

  fetchAllDuplicates(
    resourceId: string,
    resourceType: string,
    pageNumber?: number,
    pageSize?: number
  ): Observable<DuplicatesWithTotal> {
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
        JsonApiResponseWithPaging<DuplicateJsonApi[], null>
      >(`${environment.apiUrl}/${resourceType}/${resourceId}/forks/`, params)
      .pipe(map((res) => DuplicatesMapper.fromDuplicatesJsonApiResponse(res)));
  }
}
