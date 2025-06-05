import { Action, State, StateContext } from '@ngxs/store';

import { catchError, tap, throwError } from 'rxjs';

import { Injectable } from '@angular/core';

import { WikiService } from '../services';

import { ClearWiki, GetHomeWiki, GetWikiContent, ToggleMode, UpdateWikiContent } from './wiki.actions';
import { WikiStateModel } from './wiki.model';

@State<WikiStateModel>({
  name: 'wiki',
  defaults: {
    homeWikiContent: {
      data: '',
      isLoading: false,
      error: null,
    },
    wikiModes: {
      view: true,
      edit: true,
      compare: false,
    },
    wikiData: {
      list: [],
      version: '',
      content: '',
      isLoading: false,
      error: null,
    },
  },
})
@Injectable()
export class WikiState {
  constructor(private wikiService: WikiService) {}

  @Action(GetHomeWiki)
  getHomeWiki(ctx: StateContext<WikiStateModel>, action: GetHomeWiki) {
    const state = ctx.getState();
    ctx.patchState({
      homeWikiContent: {
        ...state.homeWikiContent,
        isLoading: true,
        error: null,
      },
    });

    return this.wikiService.getHomeWiki(action.projectId).pipe(
      tap((content) => {
        ctx.patchState({
          homeWikiContent: {
            data: content,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, error))
    );
  }

  @Action(ClearWiki)
  clearWiki(ctx: StateContext<WikiStateModel>) {
    ctx.patchState({
      homeWikiContent: {
        data: '',
        isLoading: false,
        error: null,
      },
    });
  }

  private handleError(ctx: StateContext<WikiStateModel>, error: Error) {
    ctx.patchState({
      homeWikiContent: {
        ...ctx.getState().homeWikiContent,
        isLoading: false,
        error: error.message,
      },
    });
    return throwError(() => error);
  }

  @Action(ToggleMode)
  toggleMode(ctx: StateContext<WikiStateModel>, action: ToggleMode) {
    const state = ctx.getState();

    const trueModesCount = Object.values(state.wikiModes).filter(Boolean).length;

    // Allow toggling if there are  2 modes true or if the mode being toggled is not currently active
    if (trueModesCount >= 2 || !state.wikiModes[action.mode]) {
      ctx.patchState({
        wikiModes: { ...state.wikiModes, [`${action.mode}`]: !state.wikiModes[action.mode] },
      });
    }
  }
  @Action(GetWikiContent)
  getWikiContent(ctx: StateContext<WikiStateModel>, action: GetWikiContent) {
    const state = ctx.getState();
    ctx.patchState({
      wikiData: {
        ...state.wikiData,
        isLoading: true,
        error: null,
      },
    });

    return this.wikiService.getWikiContent(action.content, '1').pipe(
      tap((content) => {
        ctx.patchState({
          wikiData: {
            ...state.wikiData,
            content: content,
            isLoading: false,
            error: null,
          },
        });
      }),
      catchError((error) => this.handleError(ctx, error))
    );
  }

  @Action(UpdateWikiContent)
  updateWikiContent(ctx: StateContext<WikiStateModel>, action: UpdateWikiContent) {
    const state = ctx.getState();
    ctx.patchState({
      wikiData: {
        ...state.wikiData,
        content: action.content,
        isLoading: false,
        error: null,
      },
    });
  }
}
