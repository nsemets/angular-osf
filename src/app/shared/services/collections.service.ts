import { createDispatchMap } from '@ngxs/store';

import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BYPASS_ERROR_INTERCEPTOR } from '@core/interceptors/error-interceptor.tokens';
import { ENVIRONMENT } from '@core/provider/environment.provider';
import {
  CollectionSubmissionReviewAction,
  CollectionSubmissionReviewActionJsonApi,
} from '@osf/features/moderation/models';

import { CollectionsMapper } from '../mappers/collections';
import { ContributorsMapper } from '../mappers/contributors';
import { ReviewActionsMapper } from '../mappers/review-actions.mapper';
import {
  CollectionDetails,
  CollectionProvider,
  CollectionSubmission,
  CollectionSubmissionActionType,
  CollectionSubmissionTargetType,
  CollectionSubmissionWithGuid,
} from '../models/collections/collections.models';
import {
  CollectionDetailsGetResponseJsonApi,
  CollectionDetailsResponseJsonApi,
  CollectionProviderResponseJsonApi,
  CollectionSubmissionJsonApi,
  CollectionSubmissionsSearchPayloadJsonApi,
  CollectionSubmissionWithGuidJsonApi,
} from '../models/collections/collections-json-api.models';
import { JsonApiResponse, ResponseJsonApi } from '../models/common/json-api.model';
import { ContributorModel } from '../models/contributors/contributor.model';
import { ContributorsResponseJsonApi } from '../models/contributors/contributor-response-json-api.model';
import { PaginatedData } from '../models/paginated-data.model';
import { ReviewActionPayload } from '../models/review-action/review-action-payload.model';
import { ReviewActionPayloadJsonApi } from '../models/review-action/review-action-payload-json-api.model';
import { SetTotalSubmissions } from '../stores/collections/collections.actions';

import { JsonApiService } from './json-api.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly environment = inject(ENVIRONMENT);

  get apiUrl() {
    return `${this.environment.apiDomainUrl}/v2`;
  }

  private actions = createDispatchMap({ setTotalSubmissions: SetTotalSubmissions });

  getCollectionProvider(collectionName: string): Observable<CollectionProvider> {
    const url = `${this.apiUrl}/providers/collections/${collectionName}/?embed=brand`;

    return this.jsonApiService
      .get<JsonApiResponse<CollectionProviderResponseJsonApi, null>>(url)
      .pipe(map((response) => CollectionsMapper.fromGetCollectionProviderResponse(response.data)));
  }

  getCollectionDetails(collectionId: string): Observable<CollectionDetails> {
    const url = `${this.apiUrl}/collections/${collectionId}/`;

    return this.jsonApiService
      .get<CollectionDetailsGetResponseJsonApi>(url)
      .pipe(map((response) => CollectionsMapper.fromGetCollectionDetailsResponse(response.data)));
  }

  searchCollectionSubmissions(
    providerId: string,
    searchText: string,
    activeFilters: Record<string, string[]>,
    page = '1',
    sortBy: string
  ): Observable<CollectionSubmissionWithGuid[]> {
    const url = `${this.apiUrl}/search/collections/`;
    const params: Record<string, string> = {
      page,
    };

    if (sortBy) {
      params['sort'] = sortBy;
    }

    const payload: CollectionSubmissionsSearchPayloadJsonApi = {
      data: {
        attributes: {
          provider: [providerId],
          ...activeFilters,
          q: searchText ? searchText : '*',
        },
      },
      type: 'search',
    };

    return this.jsonApiService.post<ResponseJsonApi<CollectionSubmissionWithGuidJsonApi[]>>(url, payload, params).pipe(
      switchMap((response) => {
        if (!response.data.length) {
          return of([]);
        }

        const totalCount = response.meta?.total ?? 0;
        this.actions.setTotalSubmissions(totalCount);

        const contributorRequests = response.data.map((submission) =>
          this.getCollectionContributors(
            submission.embeds.guid.data.relationships!.bibliographic_contributors!.links.related.href
          ).pipe(catchError(() => of([])))
        );

        if (!contributorRequests.length) {
          return of([]);
        }

        return forkJoin(contributorRequests).pipe(
          map((contributorsArrays) =>
            response.data.map((submission, index) => ({
              ...CollectionsMapper.fromPostCollectionSubmissionsResponse([submission])[0],
              contributors: contributorsArrays[index],
            }))
          )
        );
      })
    );
  }

  fetchCollectionSubmissionsByStatus(
    collectionId: string,
    status: string,
    page = '1',
    sortBy: string
  ): Observable<PaginatedData<CollectionSubmissionWithGuid[]>> {
    const params: Record<string, string> = {
      page,
      'filter[reviews_state]': status,
      'page[size]': '10',
      embed: 'creator',
      sort: sortBy,
    };

    return this.jsonApiService
      .get<
        ResponseJsonApi<CollectionSubmissionWithGuidJsonApi[]>
      >(`${this.apiUrl}/collections/${collectionId}/collection_submissions/`, params)
      .pipe(map((response) => CollectionsMapper.fromGetCollectionSubmissionsResponse(response)));
  }

  fetchProjectCollections(projectId: string, is_public: boolean, bookmarks: boolean): Observable<CollectionDetails[]> {
    const params: Record<string, boolean> = {
      'filter[is_public]': is_public,
      'filter[bookmarks]': bookmarks,
    };
    return this.jsonApiService
      .get<
        JsonApiResponse<CollectionDetailsResponseJsonApi[], null>
      >(`${this.apiUrl}/nodes/${projectId}/collections/`, params)
      .pipe(
        map((response) =>
          response.data.map((collection) => CollectionsMapper.fromGetCollectionDetailsResponse(collection))
        )
      );
  }

  fetchCurrentSubmission(projectId: string, collectionId: string): Observable<CollectionSubmission> {
    const params: Record<string, string> = {
      'filter[id]': projectId,
      embed: 'collection',
    };

    return this.jsonApiService
      .get<
        JsonApiResponse<CollectionSubmissionJsonApi[], null>
      >(`${this.apiUrl}/collections/${collectionId}/collection_submissions/`, params)
      .pipe(map((response) => CollectionsMapper.fromCurrentSubmissionResponse(response.data[0])));
  }

  fetchCollectionSubmissionsActions(
    projectId: string,
    collectionId: string
  ): Observable<CollectionSubmissionReviewAction[]> {
    const params: Record<string, unknown> = {
      embed: 'creator',
    };

    return this.jsonApiService
      .get<
        JsonApiResponse<CollectionSubmissionReviewActionJsonApi[], null>
      >(`${this.apiUrl}/collection_submissions/${projectId}-${collectionId}/actions/?sort=-date_modified`, params)
      .pipe(map((response) => CollectionsMapper.fromGetCollectionSubmissionsActionsResponse(response.data)));
  }

  fetchAllUserCollectionSubmissions(
    providerId: string,
    projectIds: string[]
  ): Observable<CollectionSubmissionWithGuid[]> {
    const pendingSubmissions$ = this.fetchUserCollectionSubmissionsByStatus(providerId, projectIds, 'pending');
    const acceptedSubmissions$ = this.fetchUserCollectionSubmissionsByStatus(providerId, projectIds, 'accepted');

    return forkJoin([pendingSubmissions$, acceptedSubmissions$]).pipe(
      map(([pending, accepted]) => [...pending.data, ...accepted.data])
    );
  }

  createCollectionSubmissionAction(
    payload: ReviewActionPayload
  ): Observable<ReviewActionPayloadJsonApi<CollectionSubmissionActionType, CollectionSubmissionTargetType>> {
    const params = ReviewActionsMapper.toReviewActionPayloadJsonApi(
      payload,
      'collection_submission_actions',
      'collection-submissions'
    );

    return this.jsonApiService.post<
      ReviewActionPayloadJsonApi<CollectionSubmissionActionType, CollectionSubmissionTargetType>
    >(`${this.apiUrl}/collection_submission_actions/`, params);
  }

  private getCollectionContributors(contributorsUrl: string): Observable<ContributorModel[]> {
    const params: Record<string, unknown> = {
      'fields[users]': 'full_name',
    };

    const context = new HttpContext();
    context.set(BYPASS_ERROR_INTERCEPTOR, true);

    return this.jsonApiService
      .get<ContributorsResponseJsonApi>(contributorsUrl, params, context)
      .pipe(map((response) => ContributorsMapper.getContributors(response.data)));
  }

  private fetchUserCollectionSubmissionsByStatus(
    providerId: string,
    projectIds: string[],
    submissionStatus: string
  ): Observable<PaginatedData<CollectionSubmissionWithGuid[]>> {
    const params: Record<string, unknown> = {
      'filter[reviews_state]': submissionStatus,
      'filter[id]': projectIds.join(','),
    };

    return this.jsonApiService
      .get<
        ResponseJsonApi<CollectionSubmissionWithGuidJsonApi[]>
      >(`${this.apiUrl}/collections/${providerId}/collection_submissions/`, params)
      .pipe(map((response) => CollectionsMapper.fromGetCollectionSubmissionsResponse(response)));
  }
}
