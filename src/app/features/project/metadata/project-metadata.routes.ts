import { Routes } from '@angular/router';

import { ProjectMetadataComponent } from '@osf/features/project/metadata/project-metadata.component';

export const projectMetadataRoutes = [
  {
    path: '',
    component: ProjectMetadataComponent,
  },
  {
    path: 'add',
    loadComponent: () => import('./pages/add-metadata/add-metadata.component').then((c) => c.AddMetadataComponent),
  },
  {
    path: ':metadata-record-id',
    loadComponent: () => import('./pages/add-metadata/add-metadata.component').then((c) => c.AddMetadataComponent),
  },
] as Routes;
