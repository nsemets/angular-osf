import { TranslatePipe } from '@ngx-translate/core';

import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { INPUT_VALIDATION_MESSAGES, InputLimits } from '@osf/shared/constants';
import { CustomValidators } from '@osf/shared/utils';

@Component({
  selector: 'osf-justification-step',
  imports: [ReactiveFormsModule, TranslatePipe, Message, Textarea],
  templateUrl: './justification-step.component.html',
  styleUrl: './justification-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JustificationStepComponent {
  private readonly fb = inject(FormBuilder);

  readonly INPUT_VALIDATION_MESSAGES = INPUT_VALIDATION_MESSAGES;

  justificationForm = this.fb.group({
    justification: ['', [Validators.maxLength(InputLimits.description.maxLength), CustomValidators.requiredTrimmed()]],
  });

  gotNext() {
    console.log(this.justificationForm.value.justification);
  }
}
