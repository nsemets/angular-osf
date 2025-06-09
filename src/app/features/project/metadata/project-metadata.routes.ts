import { Routes } from '@angular/router';

import { ProjectMetadataComponent } from '@osf/features/project/metadata/project-metadata.component';

export const projectMetadataRoutes = [
  {
    path: '',
    component: ProjectMetadataComponent,
  },
] as Routes;
