import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { SubjectModel, SubjectsResponseJsonApi } from '@shared/models';

import { ResourceType } from '../enums/resource-type.enum';
import { SubjectMapper } from '../mappers/subjects';

import { JsonApiService } from './json-api.service';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly environment = inject(ENVIRONMENT);

  get apiUrl() {
    return `${this.environment.apiDomainUrl}/v2`;
  }

  get defaultProvider() {
    return this.environment.defaultProvider;
  }

  private readonly urlMap = new Map<ResourceType, string>([
    [ResourceType.Project, 'nodes'],
    [ResourceType.Registration, 'registrations'],
    [ResourceType.Preprint, 'preprints'],
    [ResourceType.DraftRegistration, 'draft_registrations'],
  ]);

  getSubjects(
    resourceType: ResourceType,
    providerId = this.defaultProvider,
    search?: string
  ): Observable<SubjectModel[]> {
    const baseUrl =
      resourceType === ResourceType.Project
        ? `${this.apiUrl}/subjects/`
        : `${this.apiUrl}/providers/${this.urlMap.get(resourceType)}/${providerId}/subjects/`;

    const params: Record<string, string> = {
      'page[size]': '100',
      sort: 'text',
      related_counts: 'children',
      'filter[parent]': 'null',
    };

    if (search) {
      delete params['filter[parent]'];
      params['filter[text]'] = search;
      params['embed'] = 'parent';
    }

    return this.jsonApiService
      .get<SubjectsResponseJsonApi>(baseUrl, params)
      .pipe(map((response) => SubjectMapper.fromSubjectsResponseJsonApi(response)));
  }

  getChildrenSubjects(parentId: string): Observable<SubjectModel[]> {
    const params: Record<string, string> = {
      'page[size]': '100',
      page: '1',
      sort: 'text',
      related_counts: 'children',
    };

    return this.jsonApiService
      .get<SubjectsResponseJsonApi>(`${this.apiUrl}/subjects/${parentId}/children/`, params)
      .pipe(map((response) => SubjectMapper.fromSubjectsResponseJsonApi(response)));
  }

  getResourceSubjects(resourceId: string, resourceType: ResourceType): Observable<SubjectModel[]> {
    const baseUrl = `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/subjects/`;
    const params: Record<string, string> = {
      'page[size]': '100',
      page: '1',
    };

    return this.jsonApiService
      .get<SubjectsResponseJsonApi>(baseUrl, params)
      .pipe(map((response) => SubjectMapper.fromSubjectsResponseJsonApi(response)));
  }

  updateResourceSubjects(resourceId: string, resourceType: ResourceType, subjects: SubjectModel[]): Observable<void> {
    const baseUrl = `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/relationships/subjects/`;
    const payload = {
      data: subjects.map((item) => ({ id: item.id, type: 'subjects' })),
    };

    return this.jsonApiService.put(baseUrl, payload);
  }
}
