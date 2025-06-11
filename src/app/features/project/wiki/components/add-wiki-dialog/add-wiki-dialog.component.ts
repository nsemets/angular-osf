import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CustomValidators } from '@osf/shared/utils';

import { CreateWiki, WikiSelectors } from '../../store';

@Component({
  selector: 'osf-add-wiki-dialog-component',
  imports: [Button, InputTextModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-wiki-dialog.component.html',
  styleUrl: './add-wiki-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWikiDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  protected actions = createDispatchMap({
    createWiki: CreateWiki,
  });
  protected isSubmitting = select(WikiSelectors.getWikiSubmitting);

  #fb = inject(FormBuilder);

  addWikiForm: FormGroup = this.#fb.group({
    name: ['', [CustomValidators.requiredTrimmed()]],
  });

  submitForm(): void {
    if (this.addWikiForm.valid) {
      // Handle form submission logic here
      console.log('Form submitted:', this.addWikiForm.value);
      this.actions.createWiki(this.config.data.projectId, this.addWikiForm.value.name).subscribe({
        next: (res) => {
          console.log('Wiki created successfully', res);
          this.dialogRef.close(res);
        },
        error: (error) => {
          console.error('Error creating wiki:', error);
          // Optionally, you can show an error message to the user
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
