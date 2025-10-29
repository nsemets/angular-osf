import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { formInputLimits } from '@osf/features/preprints/constants';
import { MetadataForm, PreprintModel, PreprintProviderDetails } from '@osf/features/preprints/models';
import {
  CreatePreprint,
  FetchLicenses,
  PreprintStepperSelectors,
  SaveLicense,
  UpdatePreprint,
} from '@osf/features/preprints/store/preprint-stepper';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { LicenseComponent } from '@osf/shared/components/license/license.component';
import { TagsInputComponent } from '@osf/shared/components/tags-input/tags-input.component';
import { TextInputComponent } from '@osf/shared/components/text-input/text-input.component';
import { INPUT_VALIDATION_MESSAGES } from '@osf/shared/constants/input-validation-messages.const';
import { CustomValidators } from '@osf/shared/helpers/custom-form-validators.helper';
import { findChangedFields } from '@osf/shared/helpers/find-changed-fields';
import { LicenseModel, LicenseOptions } from '@osf/shared/models';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { PreprintsAffiliatedInstitutionsComponent } from './preprints-affiliated-institutions/preprints-affiliated-institutions.component';
import { PreprintsContributorsComponent } from './preprints-contributors/preprints-contributors.component';
import { PreprintsSubjectsComponent } from './preprints-subjects/preprints-subjects.component';

@Component({
  selector: 'osf-preprints-metadata',
  imports: [
    PreprintsContributorsComponent,
    Button,
    Card,
    ReactiveFormsModule,
    Message,
    TranslatePipe,
    DatePicker,
    IconComponent,
    InputText,
    TextInputComponent,
    Tooltip,
    LicenseComponent,
    TagsInputComponent,
    PreprintsSubjectsComponent,
    PreprintsAffiliatedInstitutionsComponent,
  ],
  templateUrl: './preprints-metadata-step.component.html',
  styleUrl: './preprints-metadata-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreprintsMetadataStepComponent implements OnInit {
  private customConfirmationService = inject(CustomConfirmationService);
  private toastService = inject(ToastService);
  private actions = createDispatchMap({
    createPreprint: CreatePreprint,
    updatePreprint: UpdatePreprint,
    fetchLicenses: FetchLicenses,
    saveLicense: SaveLicense,
  });

  metadataForm!: FormGroup<MetadataForm>;
  inputLimits = formInputLimits;
  readonly INPUT_VALIDATION_MESSAGES = INPUT_VALIDATION_MESSAGES;
  today = new Date();

  licenses = select(PreprintStepperSelectors.getLicenses);
  createdPreprint = select(PreprintStepperSelectors.getPreprint);
  isUpdatingPreprint = select(PreprintStepperSelectors.isPreprintSubmitting);

  provider = input.required<PreprintProviderDetails | undefined>();
  nextClicked = output<void>();
  backClicked = output<void>();

  ngOnInit() {
    this.actions.fetchLicenses();
    this.initForm();
  }

  initForm() {
    const publicationDate = this.createdPreprint()?.originalPublicationDate;
    this.metadataForm = new FormGroup<MetadataForm>({
      doi: new FormControl(this.createdPreprint()?.doi || null, {
        nonNullable: true,
        validators: [CustomValidators.doiValidator],
      }),
      originalPublicationDate: new FormControl(publicationDate ? new Date(publicationDate) : null, {
        nonNullable: false,
        validators: [],
      }),
      customPublicationCitation: new FormControl(this.createdPreprint()?.customPublicationCitation || null, {
        nonNullable: false,
        validators: [Validators.maxLength(this.inputLimits.citation.maxLength)],
      }),
      tags: new FormControl(this.createdPreprint()?.tags || [], {
        nonNullable: true,
        validators: [],
      }),
      subjects: new FormControl([], {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  nextButtonClicked() {
    if (this.metadataForm.invalid) {
      return;
    }

    const model = this.metadataForm.value;

    const changedFields = findChangedFields<PreprintModel>(model, this.createdPreprint()!);

    this.actions.updatePreprint(this.createdPreprint()!.id, changedFields).subscribe({
      complete: () => {
        this.toastService.showSuccess('preprints.preprintStepper.common.successMessages.preprintSaved');
        this.nextClicked.emit();
      },
    });
  }

  createLicense(licenseDetails: { id: string; licenseOptions: LicenseOptions }) {
    this.actions.saveLicense(licenseDetails.id, licenseDetails.licenseOptions);
  }

  selectLicense(license: LicenseModel) {
    if (license.requiredFields.length) {
      return;
    }
    this.actions.saveLicense(license.id);
  }

  updateTags(updatedTags: string[]) {
    this.metadataForm.patchValue({
      tags: updatedTags,
    });
  }

  backButtonClicked() {
    const formValue = this.metadataForm.value;
    delete formValue.subjects;
    const changedFields = findChangedFields<PreprintModel>(formValue, this.createdPreprint()!);

    if (!Object.keys(changedFields).length) {
      this.backClicked.emit();
      return;
    }

    this.customConfirmationService.confirmContinue({
      headerKey: 'common.discardChanges.header',
      messageKey: 'common.discardChanges.message',
      onConfirm: () => {
        this.backClicked.emit();
      },
      onReject: () => null,
    });
  }
}
