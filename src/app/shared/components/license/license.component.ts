import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component, effect, input, model, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InputLimits } from '@osf/shared/constants/input-limits.const';
import { CustomValidators } from '@osf/shared/helpers/custom-form-validators.helper';
import { StringOrNullOrUndefined } from '@osf/shared/helpers/types.helper';
import { LicenseForm, LicenseModel, LicenseOptions } from '@shared/models';
import { InterpolatePipe } from '@shared/pipes';

import { TextInputComponent } from '../text-input/text-input.component';
import { TruncatedTextComponent } from '../truncated-text/truncated-text.component';

@Component({
  selector: 'osf-license',
  imports: [
    TranslatePipe,
    Select,
    FormsModule,
    Divider,
    DatePicker,
    TextInputComponent,
    ReactiveFormsModule,
    Button,
    TruncatedTextComponent,
    InterpolatePipe,
  ],
  templateUrl: './license.component.html',
  styleUrl: './license.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseComponent {
  selectedLicenseId = input<StringOrNullOrUndefined>(null);
  selectedLicenseOptions = input<LicenseOptions | null | undefined>(null);
  licenses = input.required<LicenseModel[]>();
  isSubmitting = input<boolean>(false);
  showInternalButtons = input<boolean>(true);
  fullWidthSelect = input<boolean>(false);
  appendTo = input<string | null>(null);
  selectedLicense = model<LicenseModel | null>(null);
  createLicense = output<{ id: string; licenseOptions: LicenseOptions }>();
  selectLicense = output<LicenseModel>();
  inputLimits = InputLimits;
  saveButtonDisabled = signal(false);

  currentYear = new Date();
  licenseForm = new FormGroup<LicenseForm>({
    year: new FormControl<string>(this.currentYear.getFullYear().toString(), {
      nonNullable: true,
      validators: [CustomValidators.requiredTrimmed()],
    }),
    copyrightHolders: new FormControl<string>('', {
      nonNullable: true,
      validators: [CustomValidators.requiredTrimmed()],
    }),
  });
  licenseFormValue = toSignal(this.licenseForm.valueChanges);

  constructor() {
    effect(() => {
      const license = this.licenses().find((l) => l.id === this.selectedLicenseId());
      this.selectedLicense.set(license || null);
    });

    effect(() => {
      const options = this.selectedLicenseOptions();
      if (this.selectedLicenseOptions()) {
        this.licenseForm.patchValue({
          year: options!.year,
          copyrightHolders: options!.copyrightHolders,
        });
      }
    });

    effect(() => {
      const licenseOptionsInput = this.selectedLicenseOptions();
      const licenseOptionsFormValue = this.licenseFormValue();

      if (!this.selectedLicense() || !this.selectedLicense()?.requiredFields.length) {
        return;
      }

      if (JSON.stringify(licenseOptionsInput) === JSON.stringify(licenseOptionsFormValue)) {
        this.saveButtonDisabled.set(true);
      } else {
        this.saveButtonDisabled.set(false);
      }
    });
  }

  onSelectLicense(license: LicenseModel): void {
    this.selectLicense.emit(license);
  }

  saveLicense() {
    if (this.licenseForm.invalid) {
      return;
    }
    const selectedLicenseId = this.selectedLicense()!.id;

    const model = this.licenseForm.value as LicenseOptions;
    this.createLicense.emit({
      id: selectedLicenseId,
      licenseOptions: model,
    });
  }

  cancel() {
    this.licenseForm.reset({
      year: '',
      copyrightHolders: '',
    });
  }
}
