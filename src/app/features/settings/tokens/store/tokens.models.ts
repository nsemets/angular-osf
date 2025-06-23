import { AsyncStateModel } from '@osf/shared/models';

import { ScopeJsonApi, Token } from '../models';

export interface TokensStateModel {
  scopes: AsyncStateModel<ScopeJsonApi[]>;
  tokens: AsyncStateModel<Token[]>;
}
