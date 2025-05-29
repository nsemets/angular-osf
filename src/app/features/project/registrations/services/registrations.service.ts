import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiResponse } from '@osf/core/models';
import { JsonApiService } from '@osf/core/services';

import { submittedRegistrations } from '../mock-data';
import { RegistrationModel, RegistrationsGetResponse } from '../models';

import { RegistrationsMapper } from './../mappers/registrations.mapper';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationsService {
  #jsonApiService = inject(JsonApiService);

  getRegistrations(projectId: string): Observable<RegistrationModel[]> {
    const url = `${environment.apiUrl}/nodes/${projectId}/registrations/`;

    return this.#jsonApiService.get<JsonApiResponse<RegistrationsGetResponse[], null>>(url).pipe(
      map((response) => {
        return response.data.length
          ? response.data.map((registration) => RegistrationsMapper.fromResponse(registration))
          : submittedRegistrations;
      })
    );
  }
}
