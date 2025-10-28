import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BYPASS_ERROR_INTERCEPTOR } from '@core/interceptors/error-interceptor.tokens';
import { ENVIRONMENT } from '@core/provider/environment.provider';
import { BaseNodeMapper, ComponentsMapper } from '@osf/shared/mappers';
import {
  BaseNodeDataJsonApi,
  BaseNodeModel,
  ComponentGetResponseJsonApi,
  ComponentOverview,
  JsonApiResponse,
  PaginatedData,
  ResponseJsonApi,
} from '@osf/shared/models';
import { JsonApiService } from '@osf/shared/services/json-api.service';

import { ProjectOverviewMapper } from '../mappers';
import { PrivacyStatusModel, ProjectOverviewResponseJsonApi, ProjectOverviewWithMeta } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProjectOverviewService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly environment = inject(ENVIRONMENT);

  get apiUrl() {
    return `${this.environment.apiDomainUrl}/v2`;
  }

  getProjectById(projectId: string): Observable<ProjectOverviewWithMeta> {
    const params: Record<string, unknown> = {
      'embed[]': ['affiliated_institutions', 'identifiers', 'license', 'storage', 'preprints'],
      'fields[institutions]': 'assets,description,name',
      'fields[preprints]': 'title,date_created',
      'fields[users]': 'family_name,full_name,given_name,middle_name',
      related_counts: 'forks,view_only_links',
    };

    return this.jsonApiService.get<ProjectOverviewResponseJsonApi>(`${this.apiUrl}/nodes/${projectId}/`, params).pipe(
      map((response) => ({
        project: ProjectOverviewMapper.fromGetProjectResponse(response.data),
        meta: response.meta,
      }))
    );
  }

  updateProjectPublicStatus(data: PrivacyStatusModel[]): Observable<BaseNodeModel[]> {
    const payload = {
      data: data.map((item) => ({ id: item.id, type: 'nodes', attributes: { public: item.public } })),
    };

    const headers = {
      'Content-Type': 'application/vnd.api+json; ext=bulk',
    };

    return this.jsonApiService
      .patch<BaseNodeDataJsonApi[]>(`${this.apiUrl}/nodes/`, payload, undefined, headers)
      .pipe(map((res) => BaseNodeMapper.getNodesData(res)));
  }

  forkResource(projectId: string, resourceType: string): Observable<void> {
    const payload = {
      data: {
        type: 'nodes',
      },
    };

    return this.jsonApiService.post<void>(`${this.apiUrl}/${resourceType}/${projectId}/forks/`, payload);
  }

  duplicateProject(projectId: string, title: string): Observable<BaseNodeModel> {
    const payload = {
      data: {
        type: 'nodes',
        attributes: {
          template_from: projectId,
          category: 'project',
          title: 'Templated from ' + title,
        },
      },
    };

    return this.jsonApiService
      .post<JsonApiResponse<BaseNodeDataJsonApi, null>>(`${this.apiUrl}/nodes/`, payload)
      .pipe(map((response) => BaseNodeMapper.getNodeData(response.data)));
  }

  createComponent(
    projectId: string,
    title: string,
    description: string | null,
    tags: string[],
    region: string | null,
    affiliatedInstitutions: string[],
    inheritContributors: boolean
  ): Observable<void> {
    const payload = {
      data: {
        type: 'nodes',
        attributes: {
          title,
          category: 'project',
          description: description || '',
          tags,
        },
      },
    };

    const params: Record<string, unknown> = {
      inherit_contributors: inheritContributors,
    };

    if (region) {
      params['region'] = region;
    }

    return this.jsonApiService
      .post<JsonApiResponse<BaseNodeDataJsonApi, null>>(`${this.apiUrl}/nodes/${projectId}/children/`, payload, params)
      .pipe(
        switchMap((response) => {
          const componentId = response.data.id;

          if (affiliatedInstitutions.length) {
            const affiliationsPayload = {
              data: affiliatedInstitutions.map((id) => ({
                type: 'institutions',
                id,
              })),
            };

            return this.jsonApiService.patch<void>(
              `${this.apiUrl}/nodes/${componentId}/relationships/institutions/`,
              affiliationsPayload
            );
          }

          return of(undefined);
        })
      );
  }

  deleteComponent(componentId: string): Observable<void> {
    return this.jsonApiService.delete(`${this.apiUrl}/nodes/${componentId}/`);
  }

  getComponents(projectId: string, page = 1, pageSize = 10): Observable<PaginatedData<ComponentOverview[]>> {
    const params: Record<string, unknown> = {
      embed: 'bibliographic_contributors',
      'fields[users]': 'family_name,full_name,given_name,middle_name',
      page: page,
      'page[size]': pageSize,
    };

    return this.jsonApiService
      .get<ResponseJsonApi<ComponentGetResponseJsonApi[]>>(`${this.apiUrl}/nodes/${projectId}/children/`, params)
      .pipe(
        map((response) => ({
          data: response.data.map((item) => ComponentsMapper.fromGetComponentResponse(item)),
          totalCount: response.meta?.total || 0,
          pageSize: response.meta?.per_page || pageSize,
        }))
      );
  }

  getParentProject(projectId: string): Observable<ProjectOverviewWithMeta> {
    const params: Record<string, unknown> = {
      'embed[]': ['bibliographic_contributors'],
      'fields[users]': 'family_name,full_name,given_name,middle_name',
    };

    const context = new HttpContext();
    context.set(BYPASS_ERROR_INTERCEPTOR, true);

    return this.jsonApiService
      .get<ProjectOverviewResponseJsonApi>(`${this.apiUrl}/nodes/${projectId}/`, params, context)
      .pipe(
        map((response) => ({
          project: ProjectOverviewMapper.fromGetProjectResponse(response.data),
          meta: response.meta,
        }))
      );
  }
}
