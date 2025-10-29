import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TextInputComponent } from '@osf/shared/components/text-input/text-input.component';
import { forbiddenFileNameCharacters, InputLimits } from '@osf/shared/constants/input-limits.const';
import { CustomValidators } from '@osf/shared/helpers/custom-form-validators.helper';

@Component({
  selector: 'osf-rename-file-dialog',
  imports: [Button, TextInputComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './rename-file-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameFileDialogComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  readonly nameMaxLength = InputLimits.title.maxLength;
  readonly nameMinLength = InputLimits.title.minLength;

  readonly renameForm = new FormGroup({
    name: new FormControl(this.config.data?.currentName ?? '', {
      nonNullable: true,
      validators: [
        CustomValidators.requiredTrimmed(),
        CustomValidators.forbiddenCharactersValidator(forbiddenFileNameCharacters),
        CustomValidators.noPeriodAtEnd(),
      ],
    }),
  });

  onSubmit(): void {
    if (this.renameForm.valid) {
      const newName = this.renameForm.getRawValue().name;
      this.dialogRef.close(newName);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
