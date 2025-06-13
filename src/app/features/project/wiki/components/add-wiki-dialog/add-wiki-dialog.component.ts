import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ToastService } from '@osf/shared/services';
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
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);

  private fb = inject(FormBuilder);

  addWikiForm: FormGroup = this.fb.group({
    name: ['', [CustomValidators.requiredTrimmed()]],
  });

  submitForm(): void {
    if (this.addWikiForm.valid) {
      this.actions.createWiki(this.config.data.projectId, this.addWikiForm.value.name).subscribe({
        next: (res) => {
          this.toastService.showSuccess(this.translateService.instant('project.wiki.addWikiSuccess'));
          this.dialogRef.close(res);
        },
      });
    }
  }
}
