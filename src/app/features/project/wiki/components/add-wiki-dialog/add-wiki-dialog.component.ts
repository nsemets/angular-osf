import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomValidators } from '@osf/shared/utils';

@Component({
  selector: 'osf-add-wiki-dialog-component',
  imports: [Button, InputTextModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-wiki-dialog.component.html',
  styleUrl: './add-wiki-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWikiDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);

  #fb = inject(FormBuilder);

  addWikiForm: FormGroup = this.#fb.group({
    name: ['', [CustomValidators.requiredTrimmed()]],
  });

  submitForm(): void {
    if (this.addWikiForm.valid) {
      // Handle form submission logic here
      console.log('Form submitted:', this.addWikiForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
