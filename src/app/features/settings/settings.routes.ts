import { Routes } from '@angular/router';
import { SettingsContainerComponent } from '@osf/features/settings/settings-container.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsContainerComponent,
    children: [
      {
        path: 'profile-settings',
        loadComponent: () =>
          import('./profile-settings/profile-settings.component').then(
            (c) => c.ProfileSettingsComponent,
          ),
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import('./account-settings/account-settings.component').then(
            (c) => c.AccountSettingsComponent,
          ),
      },
    ],
  },
];
