import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'osf-create-folder-dialog',
  standalone: true,
  imports: [Button, InputText, ReactiveFormsModule, TranslatePipe],
  template: `
    <form [formGroup]="folderForm" (ngSubmit)="onSubmit()">
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="folderName" class="font-semibold">{{ 'project.files.folderName' | translate }}</label>
          <input
            pInputText
            formControlName="name"
            id="folderName"
            class="w-full"
            autocomplete="off"
            placeholder="{{ 'project.files.enterFolderName' | translate }}"
          />
        </div>

        <div class="flex justify-content-end gap-2">
          <p-button
            type="button"
            severity="secondary"
            [label]="'common.buttons.cancel' | translate"
            (click)="this.dialogRef.close('')"
          ></p-button>
          <p-button
            type="submit"
            [label]="'common.buttons.create' | translate"
            [disabled]="!folderForm.valid"
          ></p-button>
        </div>
      </div>
    </form>
  `,
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
