import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';

import { ChangeDetectionStrategy, Component, effect, HostBinding, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { UpdateProfileSettingsEducation, UserSelectors } from '@osf/core/store/user';
import { Education } from '@osf/shared/models';
import { LoaderService, ToastService } from '@osf/shared/services';
import { CustomValidators } from '@osf/shared/utils';

import { MAX_DATE, MIN_DATE } from '../../constants';
import { EducationForm } from '../../models';

@Component({
  selector: 'osf-education',
  imports: [ReactiveFormsModule, Button, InputText, DatePicker, Checkbox, TranslatePipe],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  @HostBinding('class') classes = 'flex flex-column gap-5';

  maxDate = MAX_DATE;
  minDate = MIN_DATE;

  readonly fb = inject(FormBuilder);
  protected readonly educationForm = this.fb.group({ educations: this.fb.array<EducationForm>([]) });

  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);

  readonly actions = createDispatchMap({ updateProfileSettingsEducation: UpdateProfileSettingsEducation });
  readonly educationItems = select(UserSelectors.getEducation);

  constructor() {
    effect(() => {
      const educations = this.educationItems();

      if (educations && educations.length > 0) {
        this.educations.clear();

        educations.forEach((education) => {
          const newEducation = this.fb.group({
            institution: [education.institution, CustomValidators.requiredTrimmed()],
            department: [education.department],
            degree: [education.degree],
            startDate: [new Date(+education.startYear, education.startMonth - 1)],
            endDate: education.ongoing
              ? ''
              : education.endYear && education.endMonth
                ? [new Date(+education.endYear, education.endMonth - 1)]
                : null,
            ongoing: [education.ongoing],
          });

          this.educations.push(newEducation);
        });
      }
    });
  }

  get educations() {
    return this.educationForm.get('educations') as FormArray;
  }

  removeEducation(index: number): void {
    this.educations.removeAt(index);
  }

  addEducation(): void {
    const newEducation = this.fb.group({
      institution: ['', [CustomValidators.requiredTrimmed()]],
      department: [''],
      degree: [''],
      startDate: [null],
      endDate: [null],
      ongoing: [false],
    });
    this.educations.push(newEducation);
  }

  saveEducation(): void {
    const educations = this.educations.value as EducationForm[];

    const formattedEducation = educations.map((education) => ({
      institution: education.institution,
      department: education.department,
      degree: education.degree,
      startYear: this.setupDates(education.startDate, null).startYear,
      startMonth: this.setupDates(education.startDate, null).startMonth,
      endYear: education.ongoing ? null : this.setupDates('', education.endDate).endYear,
      endMonth: education.ongoing ? null : this.setupDates('', education.endDate).endMonth,
      ongoing: education.ongoing,
    })) satisfies Education[];

    this.loaderService.show();

    this.actions.updateProfileSettingsEducation({ education: formattedEducation }).subscribe(() => {
      this.loaderService.hide();
      this.toastService.showSuccess('settings.profileSettings.education.successUpdate');
    });
  }

  private setupDates(
    startDate: Date | string,
    endDate: Date | null
  ): {
    startYear: number;
    startMonth: number;
    endYear: number | null;
    endMonth: number | null;
  } {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    return {
      startYear: start.getFullYear(),
      startMonth: start.getMonth() + 1,
      endYear: end ? end.getFullYear() : null,
      endMonth: end ? end.getMonth() + 1 : null,
    };
  }
}
