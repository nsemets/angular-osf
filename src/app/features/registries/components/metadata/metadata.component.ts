import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TextInputComponent } from '@osf/shared/components';
import { INPUT_VALIDATION_MESSAGES, InputLimits } from '@osf/shared/constants';
import { CustomConfirmationService, ToastService } from '@osf/shared/services';
import { CustomValidators } from '@osf/shared/utils';

import { Registration } from '../../models';
import { DeleteDraft, RegistriesSelectors } from '../../store';

import { ContributorsComponent } from './contributors/contributors.component';
import { RegistriesLicenseComponent } from './registries-license/registries-license.component';
import { RegistriesSubjectsComponent } from './registries-subjects/registries-subjects.component';
import { RegistriesTagsComponent } from './registries-tags/registries-tags.component';

@Component({
  selector: 'osf-metadata',
  imports: [
    Card,
    TextInputComponent,
    ReactiveFormsModule,
    Button,
    TranslatePipe,
    TextareaModule,
    ContributorsComponent,
    RegistriesSubjectsComponent,
    RegistriesTagsComponent,
    RegistriesLicenseComponent,
    Message,
  ],
  templateUrl: './metadata.component.html',
  styleUrl: './metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customConfirmationService = inject(CustomConfirmationService);

  private readonly draftId = this.route.snapshot.params['id'];
  protected readonly draftRegistration = select(RegistriesSelectors.getDraftRegistration);

  protected actions = createDispatchMap({
    deleteDraft: DeleteDraft,
  });
  protected inputLimits = InputLimits;
  readonly INPUT_VALIDATION_MESSAGES = INPUT_VALIDATION_MESSAGES;

  metadataForm = this.fb.group({
    title: ['', CustomValidators.requiredTrimmed()],
    description: ['', CustomValidators.requiredTrimmed()],
    // contributors: [[], Validators.required],
    subjects: [[], Validators.required],
    tags: [[]],
    license: [null as Registration['license'] | null, Validators.required],
  });

  constructor() {
    effect(() => {
      const draft = this.draftRegistration();
      if (draft) {
        this.initForm(draft);
      }
    });
  }

  private initForm(data: Registration): void {
    this.metadataForm.patchValue({
      title: data.title,
      description: data.description,
      license: data.license,
    });
  }

  submitMetadata(): void {
    console.log('Metadata submitted', this.metadataForm);
    this.router.navigate(['../1'], {
      relativeTo: this.route,
    });
  }

  deleteDraft(): void {
    this.customConfirmationService.confirmDelete({
      headerKey: 'registries.deleteDraft',
      messageKey: 'registries.confirmDeleteDraft',
      onConfirm: () => {
        this.actions.deleteDraft(this.draftId).subscribe({
          next: () => {
            this.router.navigateByUrl('/registries/new');
          },
        });
      },
    });
  }
}
