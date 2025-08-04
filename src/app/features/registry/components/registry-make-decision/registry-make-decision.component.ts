import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RadioButton } from 'primeng/radiobutton';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { SubmissionReviewStatus } from '@osf/features/moderation/enums';
import { ModerationDecisionFormControls, ModerationSubmitType } from '@osf/shared/enums';
import { DateAgoPipe } from '@osf/shared/pipes';

import { GetRegistryReviewActions, RegistryOverviewSelectors, SubmitDecision } from '../../store/registry-overview';

@Component({
  selector: 'osf-registry-make-decision',
  imports: [Button, TranslatePipe, DateAgoPipe, FormsModule, RadioButton, ReactiveFormsModule, Textarea],
  templateUrl: './registry-make-decision.component.html',
  styleUrl: './registry-make-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistryMakeDecisionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly config = inject(DynamicDialogConfig);
  protected readonly dialogRef = inject(DynamicDialogRef);

  protected readonly ModerationSubmitType = ModerationSubmitType;
  protected readonly SubmissionReviewStatus = SubmissionReviewStatus;
  protected readonly ModerationDecisionFormControls = ModerationDecisionFormControls;
  protected reviewActions = select(RegistryOverviewSelectors.getReviewActions);

  protected isLoading = select(RegistryOverviewSelectors.areReviewActionsLoading);
  protected isSubmitting = select(RegistryOverviewSelectors.isReviewActionSubmitting);
  protected requestForm!: FormGroup;

  protected actions = createDispatchMap({
    getRegistryReviewActions: GetRegistryReviewActions,
    submitDecision: SubmitDecision,
  });

  ngOnInit() {
    this.actions.getRegistryReviewActions(this.config.data);
    this.initForm();
  }

  protected handleSubmission(): void {
    console.log('Submit');
  }

  private initForm(): void {
    this.requestForm = this.fb.group({
      [ModerationDecisionFormControls.Action]: new FormControl('', [Validators.required]),
      [ModerationDecisionFormControls.Comment]: new FormControl(''),
    });
  }
}
