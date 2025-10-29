import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { GetEmails } from '@core/store/user-emails';
import { UserSelectors } from '@osf/core/store/user';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { FetchRegions } from '@osf/shared/stores/regions';

import {
  AffiliatedInstitutionsComponent,
  ChangePasswordComponent,
  ConnectedEmailsComponent,
  ConnectedIdentitiesComponent,
  DeactivateAccountComponent,
  DefaultStorageLocationComponent,
  ShareIndexingComponent,
  TwoFactorAuthComponent,
} from './components';
import { GetAccountSettings, GetExternalIdentities, GetUserInstitutions } from './store';

@Component({
  selector: 'osf-account-settings',
  imports: [
    ReactiveFormsModule,
    SubHeaderComponent,
    ConnectedEmailsComponent,
    DefaultStorageLocationComponent,
    ConnectedIdentitiesComponent,
    ShareIndexingComponent,
    ChangePasswordComponent,
    TwoFactorAuthComponent,
    DeactivateAccountComponent,
    AffiliatedInstitutionsComponent,
    TranslatePipe,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent {
  readonly actions = createDispatchMap({
    getAccountSettings: GetAccountSettings,
    getEmails: GetEmails,
    getExternalIdentities: GetExternalIdentities,
    getRegions: FetchRegions,
    getUserInstitutions: GetUserInstitutions,
  });
  readonly currentUser = select(UserSelectors.getCurrentUser);

  constructor() {
    effect(() => {
      if (this.currentUser()) {
        this.actions.getAccountSettings();
        this.actions.getEmails();
        this.actions.getExternalIdentities();
        this.actions.getRegions();
        this.actions.getUserInstitutions();
      }
    });
  }
}
