import { Action, State, StateContext } from '@ngxs/store';
import { insertItem, updateItem } from '@ngxs/store/operators';

import { catchError, of, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { handleSectionError } from '@osf/shared/helpers/state-error.handler';

import { NodeAnalyticsModel, RelatedCountsModel } from '../models';
import { AnalyticsService } from '../services';

import { ClearAnalytics, GetMetrics, GetRelatedCounts } from './analytics.actions';
import { ANALYTICS_DEFAULT_STATE, AnalyticsStateModel } from './analytics.model';

@State<AnalyticsStateModel>({
  name: 'analytics',
  defaults: ANALYTICS_DEFAULT_STATE,
})
@Injectable()
export class AnalyticsState {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000;

  @Action(GetMetrics)
  getMetrics(ctx: StateContext<AnalyticsStateModel>, action: GetMetrics) {
    const state = ctx.getState();
    const metricsId = `${action.resourceId}:${action.dateRange}`;

    const cachedData = state.metrics.data.find((m) => m.id === metricsId);
    const shouldRefresh = this.shouldRefresh(cachedData?.lastFetched);

    if (cachedData && !shouldRefresh) {
      return of(cachedData).pipe(
        tap(() =>
          ctx.patchState({
            metrics: { ...state.metrics, isLoading: false, error: null },
          })
        )
      );
    }

    ctx.patchState({
      metrics: { ...state.metrics, isLoading: true, error: null },
    });

    return this.analyticsService.getMetrics(action.resourceId, action.dateRange).pipe(
      tap((metrics) => {
        const exists = state.metrics.data.some((m) => m.id === metrics.id);
        metrics.lastFetched = Date.now();

        ctx.patchState({
          metrics: {
            data: exists
              ? updateItem<NodeAnalyticsModel>((m) => m.id === metrics.id, metrics)(state.metrics.data)
              : insertItem<NodeAnalyticsModel>(metrics)(state.metrics.data),
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'metrics', error))
    );
  }

  @Action(GetRelatedCounts)
  getRelatedCounts(ctx: StateContext<AnalyticsStateModel>, action: GetRelatedCounts) {
    const state = ctx.getState();
    const relatedCountsId = action.resourceId;

    const cachedData = state.relatedCounts.data.find((rc) => rc.id === relatedCountsId);
    const shouldRefresh = this.shouldRefresh(cachedData?.lastFetched);

    if (cachedData && !shouldRefresh) {
      return of(cachedData).pipe(
        tap(() =>
          ctx.patchState({
            relatedCounts: { ...state.relatedCounts, isLoading: false, error: null },
          })
        )
      );
    }

    ctx.patchState({
      relatedCounts: { ...state.relatedCounts, isLoading: true, error: null },
    });

    if (!action.resourceType) {
      return;
    }

    return this.analyticsService.getRelatedCounts(action.resourceId, action.resourceType).pipe(
      tap((relatedCounts) => {
        const exists = state.relatedCounts.data.some((rc) => rc.id === relatedCounts.id);
        relatedCounts.lastFetched = Date.now();

        ctx.patchState({
          relatedCounts: {
            data: exists
              ? updateItem<RelatedCountsModel>(
                  (rc) => rc.id === relatedCounts.id,
                  relatedCounts
                )(state.relatedCounts.data)
              : insertItem<RelatedCountsModel>(relatedCounts)(state.relatedCounts.data),
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => handleSectionError(ctx, 'relatedCounts', error))
    );
  }

  @Action(ClearAnalytics)
  clearAnalytics(ctx: StateContext<AnalyticsStateModel>) {
    ctx.patchState(ANALYTICS_DEFAULT_STATE);
  }

  private shouldRefresh(lastFetched: number | undefined): boolean {
    if (!lastFetched) {
      return true;
    }

    return Date.now() - lastFetched > this.REFRESH_INTERVAL;
  }
}
