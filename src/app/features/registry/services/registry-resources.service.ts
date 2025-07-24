import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@core/services';
import { MapRegistryResource } from '@osf/features/registry/mappers';
import { GetRegistryResourcesJsonApi, RegistryResource } from '@osf/features/registry/models';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { AddResourceRequest } from '@osf/features/registry/models/resources/add-resource-request.model';
import { AddResourceJsonApi } from '@osf/features/registry/models/resources/add-resource-response-json-api.model';
import { ConfirmAddResource } from '@osf/features/registry/models/resources/confirm-add-resource.model';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistryResourcesService {
  private jsonApiService = inject(JsonApiService);

  getResources(registryId: string): Observable<RegistryResource[]> {
    return this.jsonApiService
      .get<GetRegistryResourcesJsonApi>(`${environment.apiUrl}/registrations/${registryId}/resources/?page=1`)
      .pipe(map((response) => response.data.map((resource) => MapRegistryResource(resource))));
  }

  addRegistryResource(resource: AddResourceRequest<AddResource>): Observable<RegistryResource> {
    return this.jsonApiService
      .patch<AddResourceJsonApi>(`${environment.apiUrl}/resources/${resource.id}`, resource)
      .pipe(
        map((response) => {
          return MapRegistryResource(response.data);
        })
      );
  }

  confirmAddingResource(resource: AddResourceRequest<ConfirmAddResource>): Observable<RegistryResource> {
    return this.jsonApiService
      .patch<AddResourceJsonApi>(`${environment.apiUrl}/resources/${resource.id}`, resource)
      .pipe(
        map((response) => {
          return MapRegistryResource(response.data);
        })
      );
  }
}
