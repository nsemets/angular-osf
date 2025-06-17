import { createDispatchMap, select } from '@ngxs/store';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { formInputLimits } from '@osf/features/preprints/constants';
import { TitleAndAbstractForm } from '@osf/features/preprints/models';
import { CreatePreprint, SubmitPreprintSelectors } from '@osf/features/preprints/store/submit-preprint';
import { CustomValidators } from '@shared/utils';

@Component({
  selector: 'osf-title-and-abstract-step',
  imports: [Card, FormsModule, InputText, Button, Textarea, RouterLink, ReactiveFormsModule, Tooltip],
  templateUrl: './title-and-abstract-step.component.html',
  styleUrl: './title-and-abstract-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleAndAbstractStepComponent implements OnInit {
  protected titleAndAbstractForm!: FormGroup<TitleAndAbstractForm>;
  protected inputLimits = formInputLimits;

  private actions = createDispatchMap({
    createPreprint: CreatePreprint,
  });

  createdPreprint = select(SubmitPreprintSelectors.getCreatedPreprint);
  providerId = select(SubmitPreprintSelectors.getSelectedProviderId);

  isCreatingPreprint = signal<boolean>(false);
  nextClicked = output<void>();

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.titleAndAbstractForm = new FormGroup<TitleAndAbstractForm>({
      title: new FormControl(this.createdPreprint()?.title || '', {
        nonNullable: true,
        validators: [CustomValidators.requiredTrimmed()],
      }),
      abstract: new FormControl(this.createdPreprint()?.description || '', {
        nonNullable: true,
        validators: [CustomValidators.requiredTrimmed(), Validators.minLength(this.inputLimits.abstract.minLength)],
      }),
    });
  }

  nextButtonClicked() {
    if (this.titleAndAbstractForm.invalid) {
      return;
    }

    const model = this.titleAndAbstractForm.value;
    if (!model) {
      return;
    }

    //TODO if created -> patch

    this.isCreatingPreprint.set(true);
    this.actions.createPreprint(model.title!, model.abstract!, this.providerId()!).subscribe({
      next: () => {
        this.isCreatingPreprint.set(false);
        this.nextClicked.emit();
      },
    });
  }
}
