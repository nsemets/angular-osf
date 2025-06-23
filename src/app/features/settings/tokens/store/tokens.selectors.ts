import { Selector } from '@ngxs/store';

import { ScopeJsonApi, Token } from '../models';

import { TokensStateModel } from './tokens.models';
import { TokensState } from './tokens.state';

export class TokensSelectors {
  @Selector([TokensState])
  static getScopes(state: TokensStateModel): ScopeJsonApi[] {
    return state.scopes.data;
  }

  @Selector([TokensState])
  static isScopesLoading(state: TokensStateModel) {
    return state.scopes.isLoading;
  }

  @Selector([TokensState])
  static getTokens(state: TokensStateModel): Token[] {
    return state.tokens.data;
  }

  @Selector([TokensState])
  static isTokensLoading(state: TokensStateModel) {
    return state.tokens.isLoading;
  }

  @Selector([TokensState])
  static getTokenById(state: TokensStateModel) {
    return (id: string | null) => state.tokens.data.find((token) => token.id === id);
  }
}
