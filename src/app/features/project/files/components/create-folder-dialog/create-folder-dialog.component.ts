import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';

import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'osf-create-folder-dialog',
  imports: [Button, InputText, ReactiveFormsModule, TranslatePipe],
  templateUrl: './create-folder-dialog.component.html',
})
export class CreateFolderDialogComponent {
  readonly dialogRef = inject(DynamicDialogRef);

  protected readonly folderForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
  });

  onSubmit(): void {
    if (this.folderForm.valid) {
      const folderName = this.folderForm.getRawValue().name.trim();
      if (folderName) {
        this.dialogRef.close(folderName);
      }
    }
  }
}
