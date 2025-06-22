import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistriesService {
  private apiUrl = environment.apiUrl;
  private readonly jsonApiService = inject(JsonApiService);

  // getProjects(): Observable<Project[]> {
  //   const params: Record<string, unknown> = {
  //     'filter[current_user_permissions]': 'admin',
  //   };
  //   return this.jsonApiService
  //     .get<ProjectsResponseJsonApi>(`${this.apiUrl}/nodes/`, params)
  //     .pipe(map((response) => ProjectsMapper.fromProjectsResponse(response)));
  // }
}
