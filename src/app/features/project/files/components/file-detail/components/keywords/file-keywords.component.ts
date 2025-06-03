import { select, Store } from '@ngxs/store';

import { TranslateModule } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { InputText } from 'primeng/inputtext';

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProjectFilesSelectors, UpdateTags } from '@osf/features/project/files/store';
import { LoadingSpinnerComponent, TextInputComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { CustomValidators } from '@shared/utils';
import { PrimeTemplate } from 'primeng/api';
import { FilterType } from '@shared/enums';
import { take } from 'rxjs';

@Component({
  selector: 'osf-file-keywords',
  standalone: true,
  templateUrl: './file-keywords.component.html',
  styleUrls: ['./file-keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TextInputComponent,
    Button,
    Chip,
    LoadingSpinnerComponent,
    InputText,
    ReactiveFormsModule,
    PrimeTemplate,
    TranslateModule
  ],
})
export class FileKeywordsComponent {
  readonly store = inject(Store);
  readonly destroyRef = inject(DestroyRef);
  readonly tags = select(ProjectFilesSelectors.getFileTags);
  readonly file = select(ProjectFilesSelectors.getOpenedFile);

  searchControl = new FormControl('', {
    nonNullable: true,
    validators: [CustomValidators.requiredTrimmed(), Validators.maxLength(InputLimits.fullName.maxLength)],
  });

  updateTags(): void {
    if (this.searchControl.value && this.file().data?.guid) {
      const updatedTags = [...this.tags().data, this.searchControl.value!];
      const fileGuid = this.file().data?.guid ?? '';
      this.store.dispatch(new UpdateTags(updatedTags, fileGuid));
      this.searchControl.reset();
    }
  }

  deleteTag(value: string): void {
    if (this.file().data?.guid) {
      const updatedTags = [...this.tags().data];
      updatedTags.splice(updatedTags.indexOf(value), 1);
      const fileGuid = this.file().data?.guid ?? '';
      this.store
        .dispatch(new UpdateTags(updatedTags, fileGuid))
        .pipe(take(1))
        .subscribe(() => {
          this.searchControl.reset();
        });
    }
  }
}
