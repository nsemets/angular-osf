import { select, Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';

import { ProjectFilesSelectors } from '@osf/features/project/files/store';

@Component({
  selector: 'osf-file-project-metadata',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './file-project-metadata.component.html',
  styleUrl: './file-project-metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileProjectMetadataComponent {
  readonly store = inject(Store);
  readonly destroyRef = inject(DestroyRef);

  projectMetadata = select(ProjectFilesSelectors.getProjectMetadata);
  contributors = select(ProjectFilesSelectors.getProjectContributors);
}
