import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { JsonApiService } from '@osf/core/services';

import { WikiMapper } from '../mappers';
import { ComponentsWikiJsonApiResponse, HomeWikiJsonApiResponse, Wiki, WikiJsonApiResponse } from '../models';
import { ComponentWiki } from '../store';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WikiService {
  readonly #jsonApiService = inject(JsonApiService);
  readonly #http = inject(HttpClient);

  getHomeWiki(projectId: string): Observable<string> {
    const params: Record<string, unknown> = {
      'filter[name]': 'home',
    };
    return this.#jsonApiService
      .get<HomeWikiJsonApiResponse>(environment.apiUrl + `/nodes/${projectId}/wikis/`, params)
      .pipe(
        map((response) => {
          const homeWiki = response.data.find((wiki) => wiki.attributes.name === 'home');
          if (!homeWiki) {
            return '';
          }
          const wiki = WikiMapper.fromGetHomeWikiResponse(homeWiki);
          return wiki.downloadLink;
        }),
        switchMap((downloadLink) => {
          if (!downloadLink) {
            return of('');
          }
          return this.#http.get(downloadLink, { responseType: 'text' });
        }),
        map((content) => (content ? content.replace(/\n/g, '<br>') : ''))
      );
  }

  getWikiList(projectId: string): Observable<Wiki[]> {
    return this.#jsonApiService
      .get<WikiJsonApiResponse>(environment.apiUrl + `/nodes/${projectId}/wikis/`)
      .pipe(map((response) => response.data.map((wiki) => WikiMapper.fromGetWikiResponse(wiki))));
  }

  getComponentsWikiList(projectId: string): Observable<ComponentWiki[]> {
    return this.#jsonApiService
      .get<ComponentsWikiJsonApiResponse>(environment.apiUrl + `/nodes/${projectId}/children/?embed=wikis`)
      .pipe(map((response) => response.data.map((component) => WikiMapper.fromGetComponentsWikiResponse(component))));
  }
}
