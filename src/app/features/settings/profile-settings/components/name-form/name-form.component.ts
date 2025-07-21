import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TextInputComponent } from '@osf/shared/components';
import { InputLimits } from '@osf/shared/constants';
import { GENERATIONAL_SUFFIXES, ORDINAL_SUFFIXES } from '@osf/shared/constants/citation-suffix.const';

import { NameForm } from '../../models';

@Component({
  selector: 'osf-name-form',
  imports: [Button, ReactiveFormsModule, TranslatePipe, TextInputComponent],
  templateUrl: './name-form.component.html',
  styleUrl: './name-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameFormComponent {
  form = input.required<FormGroup<NameForm>>();

  readonly inputLimits = InputLimits;

  autoFill() {
    const fullName = this.form().controls.fullName.value?.trim();

    if (!fullName) {
      return;
    }

    const parsed = this.parseFullName(fullName);

    this.form().patchValue({
      givenName: parsed.givenName,
      middleNames: parsed.middleNames || '',
      familyName: parsed.familyName,
      suffix: parsed.suffix || '',
    });
  }

  private parseFullName(fullName: string): {
    givenName: string;
    middleNames?: string;
    familyName: string;
    suffix?: string;
  } {
    const nameParts = fullName.split(/\s+/).filter((part) => part.length > 0);

    if (nameParts.length === 0) {
      return { givenName: '', familyName: '' };
    }

    if (nameParts.length === 1) {
      return {
        givenName: '',
        familyName: nameParts[0],
      };
    }

    let suffix: string | undefined;
    const workingParts = [...nameParts];

    const lastPart = workingParts[workingParts.length - 1]?.toLowerCase();
    if (lastPart && this.isValidSuffix(lastPart)) {
      suffix = workingParts.pop();
    }

    if (workingParts.length === 1) {
      return {
        givenName: '',
        familyName: workingParts[0],
        suffix,
      };
    }

    const givenName = workingParts[0];
    const familyName = workingParts[workingParts.length - 1];
    const middleNames = workingParts.slice(1, -1).join(' ') || undefined;

    return {
      givenName,
      middleNames,
      familyName,
      suffix,
    };
  }

  private isValidSuffix(suffix: string): boolean {
    const lower = suffix.toLowerCase();

    if (
      GENERATIONAL_SUFFIXES.includes(lower) ||
      (lower.endsWith('.') && GENERATIONAL_SUFFIXES.includes(lower.slice(0, -1)))
    ) {
      return true;
    }

    if (ORDINAL_SUFFIXES.includes(lower)) {
      return true;
    }

    return false;
  }
}
