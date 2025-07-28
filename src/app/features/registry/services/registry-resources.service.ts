import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@core/services';
import { MapRegistryResource } from '@osf/features/registry/mappers';
import { GetRegistryResourcesJsonApi, RegistryResource } from '@osf/features/registry/models';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { AddResourceRequest } from '@osf/features/registry/models/resources/add-resource-request.model';
import {
  AddResourceJsonApi,
  RegistryResourceDataJsonApi,
} from '@osf/features/registry/models/resources/add-resource-response-json-api.model';
import { ConfirmAddResource } from '@osf/features/registry/models/resources/confirm-add-resource.model';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistryResourcesService {
  private jsonApiService = inject(JsonApiService);

  getResources(registryId: string): Observable<RegistryResource[]> {
    const params = {
      'fields[resources]': 'description,finalized,resource_type,pid',
    };

    return this.jsonApiService
      .get<GetRegistryResourcesJsonApi>(`${environment.apiUrl}/registrations/${registryId}/resources/?page=1`, params)
      .pipe(map((response) => response.data.map((resource) => MapRegistryResource(resource))));
  }

  addRegistryResource(registryId: string): Observable<RegistryResource> {
    const body = {
      data: {
        relationships: {
          registration: {
            data: {
              type: 'registrations',
              id: registryId,
            },
          },
        },
        type: 'resources',
      },
    };

    return this.jsonApiService.post<AddResourceJsonApi>(`${environment.apiUrl}/resources/`, body).pipe(
      map((response) => {
        return MapRegistryResource(response.data);
      })
    );
  }

  previewRegistryResource(resource: AddResourceRequest<AddResource>): Observable<RegistryResource> {
    const payload = {
      data: {
        ...resource,
      },
    };

    return this.jsonApiService
      .patch<RegistryResourceDataJsonApi>(`${environment.apiUrl}/resources/${resource.id}`, payload)
      .pipe(
        map((response) => {
          return MapRegistryResource(response);
        })
      );
  }

  confirmAddingResource(resource: AddResourceRequest<ConfirmAddResource>): Observable<RegistryResource> {
    const payload = {
      data: {
        ...resource,
      },
    };

    return this.jsonApiService
      .patch<RegistryResourceDataJsonApi>(`${environment.apiUrl}/resources/${resource.id}`, payload)
      .pipe(
        map((response) => {
          return MapRegistryResource(response);
        })
      );
  }

  deleteResource(resourceId: string): Observable<void> {
    return this.jsonApiService.delete(`${environment.apiUrl}/resources/${resourceId}`);
  }

  updateResource(resource: AddResourceRequest<AddResource>) {
    const payload = {
      data: {
        ...resource,
      },
    };

    return this.jsonApiService.patch(`${environment.apiUrl}/resources/${resource.id}`, payload);
  }
}
