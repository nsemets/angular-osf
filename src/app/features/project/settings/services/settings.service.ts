import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@core/services/json-api/json-api.service';
import { ProjectSettingsModel, ProjectSettingsResponseModel } from '@osf/features/project/settings';
import { SettingsMapper } from '@osf/features/project/settings/mappers/settings.mapper';

import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly baseUrl = environment.apiUrl;

  private readonly jsonApiService = inject(JsonApiService);

  getProjectSettings(nodeId: string): Observable<ProjectSettingsModel> {
    return this.jsonApiService
      .get<ProjectSettingsResponseModel>(`${this.baseUrl}/nodes/${nodeId}/settings`)
      .pipe(map((response) => SettingsMapper.fromResponse(response)));
  }
}
