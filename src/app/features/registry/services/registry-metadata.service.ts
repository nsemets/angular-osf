import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';

import { RegistryMetadataMapper } from '../mappers';
import {
  BibliographicContributorsJsonApi,
  CrossRefFundersResponse,
  CustomItemMetadataRecord,
  CustomItemMetadataResponse,
  RegistryOverview,
  RegistrySubjectsJsonApi,
  UserInstitutionsResponse,
} from '../models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistryMetadataService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly apiUrl = environment.apiUrl;

  getBibliographicContributors(
    registryId: string,
    page = 1,
    pageSize = 100
  ): Observable<BibliographicContributorsJsonApi> {
    const params: Record<string, unknown> = {
      'fields[contributors]': 'index,users',
      'fields[users]': 'full_name',
      page: page,
      'page[size]': pageSize,
    };

    return this.jsonApiService.get<BibliographicContributorsJsonApi>(
      `${this.apiUrl}/registrations/${registryId}/bibliographic_contributors/`,
      params
    );
  }

  getCustomItemMetadata(guid: string): Observable<CustomItemMetadataResponse> {
    return this.jsonApiService.get<CustomItemMetadataResponse>(`${this.apiUrl}/custom_item_metadata_records/${guid}/`);
  }

  updateCustomItemMetadata(guid: string, metadata: CustomItemMetadataRecord): Observable<CustomItemMetadataResponse> {
    return this.jsonApiService.put<CustomItemMetadataResponse>(`${this.apiUrl}/custom_item_metadata_records/${guid}/`, {
      data: {
        type: 'custom-item-metadata-records',
        attributes: metadata,
      },
    });
  }

  getFundersList(searchQuery?: string): Observable<CrossRefFundersResponse> {
    let url = environment.funderApiUrl;

    if (searchQuery && searchQuery.trim()) {
      url += `&query=${encodeURIComponent(searchQuery.trim())}`;
    }

    return this.jsonApiService.get<CrossRefFundersResponse>(url);
  }

  getRegistryForMetadata(registryId: string): Observable<RegistryOverview> {
    const params: Record<string, unknown> = {
      'embed[]': ['contributors', 'affiliated_institutions', 'identifiers', 'license', 'subjects_acceptable'],
      'fields[institutions]': 'assets,description,name',
      'fields[users]': 'family_name,full_name,given_name,middle_name',
      'fields[subjects]': 'text,taxonomy',
    };

    return this.jsonApiService
      .get<{ data: Record<string, unknown> }>(`${environment.apiUrl}/registrations/${registryId}/`, params)
      .pipe(map((response) => RegistryMetadataMapper.fromMetadataApiResponse(response.data)));
  }

  updateRegistryDetails(registryId: string, updates: Partial<Record<string, unknown>>): Observable<RegistryOverview> {
    const payload = {
      data: {
        id: registryId,
        type: 'registrations',
        attributes: updates,
      },
    };

    return this.jsonApiService
      .patch<Record<string, unknown>>(`${this.apiUrl}/registrations/${registryId}`, payload)
      .pipe(map((response) => RegistryMetadataMapper.fromMetadataApiResponse(response)));
  }

  getUserInstitutions(userId: string, page = 1, pageSize = 10): Observable<UserInstitutionsResponse> {
    const params = {
      page: page.toString(),
      'page[size]': pageSize.toString(),
    };

    return this.jsonApiService.get<UserInstitutionsResponse>(`${this.apiUrl}/users/${userId}/institutions/`, {
      params,
    });
  }

  getRegistrySubjects(registryId: string, page = 1, pageSize = 100): Observable<RegistrySubjectsJsonApi> {
    const params: Record<string, unknown> = {
      'page[size]': pageSize,
      page: page,
    };

    return this.jsonApiService.get<RegistrySubjectsJsonApi>(
      `${this.apiUrl}/registrations/${registryId}/subjects/`,
      params
    );
  }
}
