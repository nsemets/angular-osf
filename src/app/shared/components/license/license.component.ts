import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component, effect, input, model, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StringOrNullOrUndefined } from '@core/helpers';
import { TextInputComponent, TruncatedTextComponent } from '@shared/components';
import { LicenseForm } from '@shared/components/license/models';
import { InputLimits } from '@shared/constants';
import { License, LicenseOptions } from '@shared/models';
import { InterpolatePipe } from '@shared/pipes';
import { CustomValidators } from '@shared/utils';

@Component({
  selector: 'osf-license',
  imports: [
    Card,
    TranslatePipe,
    Select,
    FormsModule,
    Divider,
    TruncatedTextComponent,
    DatePicker,
    TextInputComponent,
    ReactiveFormsModule,
    Button,
    InterpolatePipe,
  ],
  templateUrl: './license.component.html',
  styleUrl: './license.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseComponent {
  selectedLicenseId = input<StringOrNullOrUndefined>(null);
  selectedLicenseOptions = input<LicenseOptions | null | undefined>(null);
  licenses = input.required<License[]>();
  selectedLicense = model<License | null>(null);
  createLicense = output<{ id: string; licenseOptions: LicenseOptions }>();
  selectLicense = output<License>();
  protected inputLimits = InputLimits;

  currentYear = new Date();
  licenseForm!: FormGroup<LicenseForm>;

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
          copyrightHolder: options!.copyrightHolder,
        });
      }
    });

    this.initForm();
  }

  onSelectLicense(license: License): void {
    if (license.requiredFields.length) {
      return;
    }

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
    this.selectedLicense.set(null);
    this.licenseForm.reset({
      year: this.currentYear.getFullYear().toString(),
      copyrightHolder: '',
    });
  }

  private initForm() {
    this.licenseForm = new FormGroup<LicenseForm>({
      year: new FormControl<string>(this.currentYear.getFullYear().toString(), {
        nonNullable: true,
        validators: [CustomValidators.requiredTrimmed()],
      }),
      copyrightHolder: new FormControl<string>('', {
        nonNullable: true,
        validators: [CustomValidators.requiredTrimmed()],
      }),
    });
  }
}
