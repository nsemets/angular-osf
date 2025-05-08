import { NgxsModule } from '@ngxs/store';

import { NgModule } from '@angular/core';

import { AuthState } from '@core/store/auth';
import { SearchState } from '@osf/features/search/store';
import { AddonsState } from '@osf/features/settings/addons/store';
import { TokensState } from '@osf/features/settings/tokens/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([AuthState, TokensState, AddonsState, SearchState]),
  ],
})
export class AppModule {}
