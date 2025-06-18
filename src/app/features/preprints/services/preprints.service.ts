import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@core/services';
import { JsonApiResponse } from '@osf/core/models';
import { PreprintsMapper } from '@osf/features/preprints/mappers';
import {
  Preprint,
  PreprintJsonApi,
  PreprintProviderDetails,
  PreprintProviderDetailsGetResponse,
  PreprintProviderShortInfo,
  Subject,
  SubjectGetResponse,
} from '@osf/features/preprints/models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PreprintsService {
  private jsonApiService = inject(JsonApiService);
  private baseUrl = `${environment.apiUrl}/providers/preprints/`;

  private domainToApiFieldMap: Record<string, string> = {
    title: 'title',
    description: 'description',
  };

  getPreprintProviderById(id: string): Observable<PreprintProviderDetails> {
    return this.jsonApiService
      .get<JsonApiResponse<PreprintProviderDetailsGetResponse, null>>(`${this.baseUrl}${id}/?embed=brand`)
      .pipe(
        map((response) => {
          return PreprintsMapper.fromPreprintProviderDetailsGetResponse(response.data);
        })
      );
  }

  getPreprintProvidersToAdvertise(): Observable<PreprintProviderShortInfo[]> {
    return this.jsonApiService
      .get<
        JsonApiResponse<PreprintProviderDetailsGetResponse[], null>
      >(`${this.baseUrl}?filter[advertise_on_discover_page]=true&reload=true`)
      .pipe(
        map((response) => {
          return PreprintsMapper.toPreprintProviderShortInfoFromGetResponse(
            response.data.filter((item) => !item.id.includes('osf'))
          );
        })
      );
  }

  getPreprintProvidersAllowingSubmissions(): Observable<PreprintProviderShortInfo[]> {
    return this.jsonApiService
      .get<
        JsonApiResponse<PreprintProviderDetailsGetResponse[], null>
      >(`${this.baseUrl}?filter[allow_submissions]=true`)
      .pipe(
        map((response) => {
          return PreprintsMapper.toPreprintProviderShortInfoFromGetResponse(response.data);
        })
      );
  }

  getHighlightedSubjectsByProviderId(providerId: string): Observable<Subject[]> {
    return this.jsonApiService
      .get<
        JsonApiResponse<SubjectGetResponse[], null>
      >(`${this.baseUrl}${providerId}/subjects/highlighted/?page[size]=20`)
      .pipe(
        map((response) => {
          return PreprintsMapper.fromSubjectsGetResponse(providerId, response.data);
        })
      );
  }

  createPreprint(title: string, abstract: string, providerId: string) {
    const payload = PreprintsMapper.toCreatePayload(title, abstract, providerId);
    return this.jsonApiService.post<PreprintJsonApi>(`${environment.apiUrl}/preprints/`, payload).pipe(
      map((response) => {
        return PreprintsMapper.fromPreprintJsonApi(response);
      })
    );
  }

  deletePreprint(id: string) {
    return this.jsonApiService.delete(`${environment.apiUrl}/preprints/${id}/`);
  }

  updatePreprint(id: string, payload: Partial<Preprint>): Observable<Preprint> {
    const apiPayload = this.mapPreprintDomainToApiPayload(payload);

    return this.jsonApiService.patch(`${environment.apiUrl}/preprints/${id}/`, {
      data: {
        type: 'preprints',
        id,
        attributes: apiPayload,
      },
    });
  }

  private mapPreprintDomainToApiPayload(domainPayload: Partial<Preprint>): Partial<PreprintJsonApi> {
    const apiPayload: Record<string, unknown> = {};
    Object.entries(domainPayload).forEach(([key, value]) => {
      if (value !== undefined && this.domainToApiFieldMap[key]) {
        apiPayload[this.domainToApiFieldMap[key]] = value;
      }
    });
    return apiPayload;
  }
}
