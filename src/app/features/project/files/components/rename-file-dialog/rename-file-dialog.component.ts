import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';

import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'osf-rename-file-dialog',
  standalone: true,
  imports: [Button, InputText, ReactiveFormsModule, TranslatePipe],
  template: `
    <form [formGroup]="renameForm" (ngSubmit)="onSubmit()">
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="fileName" class="font-semibold">{{ 'project.files.newName' | translate }}</label>
          <input
            pInputText
            formControlName="name"
            id="fileName"
            class="w-full"
            autocomplete="off"
            placeholder="{{ 'project.files.enterNewName' | translate }}"
          />
        </div>

        <div class="flex justify-content-end gap-2">
          <p-button
            type="button"
            severity="secondary"
            [label]="'common.buttons.cancel' | translate"
            (click)="onCancel()"
          ></p-button>
          <p-button
            type="submit"
            [label]="'common.buttons.rename' | translate"
            [disabled]="!renameForm.valid"
          ></p-button>
        </div>
      </div>
    </form>
  `,
})
export class RenameFileDialogComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  protected readonly renameForm = new FormGroup({
    name: new FormControl(this.config.data?.currentName ?? '', { nonNullable: true }),
  });

  onSubmit(): void {
    if (this.renameForm.valid) {
      const newName = this.renameForm.getRawValue().name;
      if (newName.trim()) {
        this.dialogRef.close(newName);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
