import { Routes } from '@angular/router';

import { CollectionsComponent } from '@osf/features/collections/collections.component';

export const collectionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CollectionsComponent,
      },
      {
        path: 'moderation',
        loadComponent: () =>
          import('@osf/features/moderation/pages/collection-moderation/collection-moderation.component').then(
            (m) => m.CollectionModerationComponent
          ),
      },
    ],
  },
];
