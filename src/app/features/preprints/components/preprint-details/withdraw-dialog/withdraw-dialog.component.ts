import { createDispatchMap } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';

import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { formInputLimits } from '@osf/features/preprints/constants';
import { ProviderReviewsWorkflow, ReviewsState } from '@osf/features/preprints/enums';
import { getPreprintDocumentType } from '@osf/features/preprints/helpers';
import { PreprintModel, PreprintProviderDetails, PreprintWordGrammar } from '@osf/features/preprints/models';
import { WithdrawPreprint } from '@osf/features/preprints/store/preprint';
import { CustomValidators } from '@osf/shared/helpers';
import { INPUT_VALIDATION_MESSAGES } from '@shared/constants';

@Component({
  selector: 'osf-withdraw-dialog',
  imports: [Textarea, ReactiveFormsModule, Message, TranslatePipe, Button, TitleCasePipe],
  templateUrl: './withdraw-dialog.component.html',
  styleUrl: './withdraw-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawDialogComponent implements OnInit {
  private readonly config = inject(DynamicDialogConfig);
  private readonly translateService = inject(TranslateService);
  private readonly environment = inject(ENVIRONMENT);

  readonly dialogRef = inject(DynamicDialogRef);

  readonly supportEmail = this.environment.supportEmail;

  private provider!: PreprintProviderDetails;
  private preprint!: PreprintModel;

  private actions = createDispatchMap({
    withdrawPreprint: WithdrawPreprint,
  });

  inputLimits = formInputLimits;
  readonly INPUT_VALIDATION_MESSAGES = INPUT_VALIDATION_MESSAGES;

  withdrawalJustificationFormControl = new FormControl('', {
    nonNullable: true,
    validators: [
      CustomValidators.requiredTrimmed(),
      Validators.minLength(this.inputLimits.withdrawalJustification.minLength),
    ],
  });
  modalExplanation = signal<string>('');
  withdrawRequestInProgress = signal<boolean>(false);
  documentType!: Record<PreprintWordGrammar, string>;

  public ngOnInit() {
    this.provider = this.config.data.provider;
    this.preprint = this.config.data.preprint;
    this.documentType = getPreprintDocumentType(this.provider, this.translateService);

    this.modalExplanation.set(this.calculateModalExplanation());
  }

  withdraw() {
    if (this.withdrawalJustificationFormControl.invalid) {
      return;
    }

    const withdrawalJustification = this.withdrawalJustificationFormControl.value;
    this.withdrawRequestInProgress.set(true);
    this.actions.withdrawPreprint(this.preprint.id, withdrawalJustification).subscribe({
      complete: () => {
        this.withdrawRequestInProgress.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.withdrawRequestInProgress.set(false);
      },
    });
  }

  private calculateModalExplanation() {
    const providerReviewWorkflow = this.provider.reviewsWorkflow;

    switch (providerReviewWorkflow) {
      case ProviderReviewsWorkflow.PreModeration: {
        if (this.preprint.reviewsState === ReviewsState.Pending) {
          return this.translateService.instant('preprints.details.withdrawDialog.preModerationNoticePending', {
            singularPreprintWord: this.documentType.singular,
          });
        } else
          return this.translateService.instant('preprints.details.withdrawDialog.preModerationNoticeAccepted', {
            singularPreprintWord: this.documentType.singular,
            pluralCapitalizedPreprintWord: this.documentType.pluralCapitalized,
          });
      }
      case ProviderReviewsWorkflow.PostModeration: {
        return this.translateService.instant('preprints.details.withdrawDialog.postModerationNotice', {
          singularPreprintWord: this.documentType.singular,
          pluralCapitalizedPreprintWord: this.documentType.pluralCapitalized,
        });
      }
      default: {
        return this.translateService.instant('preprints.details.withdrawDialog.noModerationNotice', {
          singularPreprintWord: this.documentType.singular,
          pluralCapitalizedPreprintWord: this.documentType.pluralCapitalized,
          supportEmail: this.supportEmail,
        });
      }
    }
  }
}
