import { createDispatchMap } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { HandleSchemaResponse } from '../../store';

@Component({
  selector: 'osf-confirm-continue-editing-dialog',
  imports: [ReactiveFormsModule, Textarea, TranslatePipe],
  templateUrl: './confirm-continue-editing-dialog.component.html',
  styleUrl: './confirm-continue-editing-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmContinueEditingDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  private readonly fb = inject(FormBuilder);
  readonly config = inject(DynamicDialogConfig);

  protected actions = createDispatchMap({
    handleSchemaResponse: HandleSchemaResponse,
  });

  form: FormGroup = this.fb.group({
    comment: [''],
  });

  submit(): void {
    const comment = this.form.value.comment;
    console.log('Comment:', comment);
    // this.actions.handleSchemaResponse();
  }
}
