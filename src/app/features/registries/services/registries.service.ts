import { Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';

import { RegistrationDataJsonApi } from '../models/registries-json-api.model';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistriesService {
  private apiUrl = environment.apiUrl;
  private readonly jsonApiService = inject(JsonApiService);

  createDraft(registrationSchemaId: string, projectId?: string | undefined): Observable<RegistrationDataJsonApi> {
    const payload = {
      data: {
        type: 'draft_registrations',
        relationships: {
          branched_from: projectId
            ? {
                data: {
                  type: 'nodes',
                  id: projectId,
                },
              }
            : undefined,
          registration_schema: {
            data: {
              type: 'registration-schemas',
              id: registrationSchemaId,
            },
          },
        },
      },
    };
    return this.jsonApiService.post(`${this.apiUrl}/draft_registrations/`, payload);
  }
}
