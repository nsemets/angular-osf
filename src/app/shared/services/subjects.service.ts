import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@core/services';
import { SubjectMapper } from '@shared/mappers';
import {
  NodeSubjectModel,
  SubjectJsonApi,
  UpdateSubjectRequestJsonApi,
  UpdateSubjectResponseJsonApi,
} from '@shared/models';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly apiUrl = environment.apiUrl;

  getSubjects(): Observable<NodeSubjectModel[]> {
    return this.jsonApiService.get<SubjectJsonApi>(`${this.apiUrl}/subjects/?page[size]=150&embed=parent`).pipe(
      map((response) => {
        return SubjectMapper.mapSubjectsResponse(response.data);
      })
    );
  }

  updateProjectSubjects(projectId: string, subjectIds: string[]): Observable<UpdateSubjectRequestJsonApi[]> {
    const payload = {
      data: subjectIds.map((id) => ({
        type: 'subjects',
        id,
      })),
    };

    return this.jsonApiService
      .put<UpdateSubjectResponseJsonApi>(`${this.apiUrl}/nodes/${projectId}/relationships/subjects/`, payload)
      .pipe(map((result) => result.data));
  }
}
