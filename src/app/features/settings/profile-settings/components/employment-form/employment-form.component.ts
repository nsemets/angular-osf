import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextInputComponent } from '@osf/shared/components/text-input/text-input.component';
import { InputLimits } from '@osf/shared/constants';

import { MAX_DATE, MIN_DATE } from '../../constants';

@Component({
  selector: 'osf-employment-form',
  imports: [ReactiveFormsModule, Button, InputText, DatePicker, Checkbox, Message, TranslatePipe, TextInputComponent],
  templateUrl: './employment-form.component.html',
  styleUrl: './employment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmploymentFormComponent implements OnInit {
  readonly maxDate = MAX_DATE;
  readonly minDate = MIN_DATE;
  readonly institutionMaxLength = InputLimits.fullName.maxLength;
  readonly dateFormat = 'mm/yy';

  private readonly destroyRef = inject(DestroyRef);

  group = input.required<FormGroup>();
  index = input.required<number>();
  remove = output<void>();

  get titleControl() {
    return this.group().controls['title'] as FormControl;
  }

  get institutionControl() {
    return this.group().controls['institution'] as FormControl;
  }

  get isDateError() {
    const form = this.group();
    return form.errors && form.errors['dateRangeInvalid'];
  }

  get startDateRequiredError() {
    const control = this.group().controls['startDate'];
    return control.invalid && control.errors?.['required'] && (control.touched || control.dirty);
  }

  get endDateRequiredError() {
    const control = this.group().controls['endDate'];
    return control.invalid && control.errors?.['required'] && (control.touched || control.dirty);
  }

  ngOnInit() {
    this.group()
      .controls['ongoing'].valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ongoing) => {
        const endDateControl = this.group().controls['endDate'];

        if (ongoing) {
          endDateControl.setValue(null);
          endDateControl.clearValidators();
        } else {
          endDateControl.setValidators([Validators.required]);
        }

        endDateControl.updateValueAndValidity();
      });
  }
}
