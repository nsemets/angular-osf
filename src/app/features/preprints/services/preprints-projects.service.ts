import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { Primitive, StringOrNull } from '@osf/shared/helpers';
import {
  ApiData,
  CreateProjectPayloadJsoApi,
  IdName,
  NodeResponseJsonApi,
  NodesResponseJsonApi,
} from '@osf/shared/models';
import { JsonApiService } from '@osf/shared/services/json-api.service';

import { PreprintsMapper } from '../mappers';
import {
  PreprintAttributesJsonApi,
  PreprintLinksJsonApi,
  PreprintModel,
  PreprintRelationshipsJsonApi,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PreprintsProjectsService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly environment = inject(ENVIRONMENT);

  get apiUrl() {
    return `${this.environment.apiDomainUrl}/v2`;
  }

  getAvailableProjects(searchTerm: StringOrNull): Observable<IdName[]> {
    const params: Record<string, Primitive> = {};
    params['page'] = 1;

    if (searchTerm) {
      params['filter[title]'] = searchTerm;
    }

    return this.jsonApiService.get<NodesResponseJsonApi>(`${this.apiUrl}/users/me/nodes/`, params).pipe(
      map((response) => {
        return response.data.map((item) => ({
          id: item.id,
          name: item.attributes.title,
        }));
      })
    );
  }

  getProjectById(projectId: string): Observable<IdName> {
    return this.jsonApiService.get<NodeResponseJsonApi>(`${this.apiUrl}/nodes/${projectId}/`).pipe(
      map((response) => {
        return {
          id: response.data.id,
          name: response.data.attributes.title,
        };
      })
    );
  }

  removePreprintProjectRelationship(preprintId: string) {
    return this.jsonApiService.patch(`${this.apiUrl}/preprints/${preprintId}/relationships/node/`, {
      data: [],
    });
  }

  updatePreprintProjectRelationship(preprintId: string, projectId: string): Observable<PreprintModel> {
    return this.jsonApiService
      .patch<ApiData<PreprintAttributesJsonApi, null, PreprintRelationshipsJsonApi, PreprintLinksJsonApi>>(
        `${this.apiUrl}/preprints/${preprintId}/`,
        {
          data: {
            type: 'preprints',
            id: preprintId,
            attributes: {},
            relationships: {
              node: {
                data: {
                  type: 'nodes',
                  id: projectId,
                },
              },
            },
          },
        }
      )
      .pipe(map((response) => PreprintsMapper.fromPreprintJsonApi(response)));
  }

  createProject(
    title: string,
    description: string,
    templateFrom: string,
    regionId: string,
    affiliationsId: string[]
  ): Observable<IdName> {
    const payload: CreateProjectPayloadJsoApi = {
      data: {
        type: 'nodes',
        attributes: {
          title,
          ...(description && { description }),
          category: 'project',
          ...(templateFrom && { template_from: templateFrom }),
          public: true,
        },
        relationships: {
          region: {
            data: {
              type: 'regions',
              id: regionId,
            },
          },
          ...(affiliationsId.length > 0 && {
            affiliated_institutions: {
              data: affiliationsId.map((id) => ({
                type: 'institutions',
                id,
              })),
            },
          }),
        },
      },
    };

    return this.jsonApiService.post<NodeResponseJsonApi>(`${this.apiUrl}/nodes/`, payload).pipe(
      map((response) => {
        return {
          id: response.data.id,
          name: response.data.attributes.title,
        };
      })
    );
  }
}
