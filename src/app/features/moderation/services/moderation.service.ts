import { map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';

import { ModerationMapper } from '../mappers';
import { Moderator, ModeratorResponseJsonApi } from '../models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModerationService {
  private readonly baseUrl = environment.apiUrl;
  private readonly jsonApiService = inject(JsonApiService);

  getCollectionModerators(providerId: string): Observable<Moderator[]> {
    return this.jsonApiService
      .get<ModeratorResponseJsonApi>(`${this.baseUrl}/providers/collections/${providerId}/moderators/`)
      .pipe(map((response) => response.data.map((moderator) => ModerationMapper.fromModeratorResponse(moderator))));
  }
}
