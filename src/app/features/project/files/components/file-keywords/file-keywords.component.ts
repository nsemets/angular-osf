import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { InputText } from 'primeng/inputtext';

import { take } from 'rxjs';

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProjectFilesSelectors, UpdateTags } from '@osf/features/project/files/store';
import { LoadingSpinnerComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { CustomValidators } from '@shared/utils';

@Component({
  selector: 'osf-file-keywords',
  imports: [Button, Chip, LoadingSpinnerComponent, InputText, ReactiveFormsModule, TranslatePipe],
  templateUrl: './file-keywords.component.html',
  styleUrls: ['./file-keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileKeywordsComponent {
  readonly actions = createDispatchMap({ updateTags: UpdateTags });
  readonly destroyRef = inject(DestroyRef);
  readonly tags = select(ProjectFilesSelectors.getFileTags);
  readonly file = select(ProjectFilesSelectors.getOpenedFile);

  keywordControl = new FormControl('', {
    nonNullable: true,
    validators: [CustomValidators.requiredTrimmed(), Validators.maxLength(InputLimits.name.maxLength)],
  });

  updateTags(): void {
    if (this.keywordControl.value && this.file().data?.guid) {
      const updatedTags = [...this.tags().data, this.keywordControl.value!];
      const fileGuid = this.file().data?.guid ?? '';
      this.actions.updateTags(updatedTags, fileGuid);
      this.keywordControl.reset();
    }
  }

  deleteTag(value: string): void {
    if (this.file().data?.guid) {
      const updatedTags = [...this.tags().data];
      updatedTags.splice(updatedTags.indexOf(value), 1);
      const fileGuid = this.file().data?.guid ?? '';
      this.actions
        .updateTags(updatedTags, fileGuid)
        .pipe(take(1))
        .subscribe(() => {
          this.keywordControl.reset();
        });
    }
  }
}
