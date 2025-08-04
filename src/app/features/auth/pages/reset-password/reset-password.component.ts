import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CustomValidators, PASSWORD_REGEX } from '@osf/shared/utils';
import { PasswordInputHintComponent } from '@shared/components';

import { ResetPasswordFormGroupType } from '../../models';

@Component({
  selector: 'osf-reset-password',
  imports: [Button, Password, ReactiveFormsModule, RouterLink, PasswordInputHintComponent, Message, TranslatePipe],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);

  isFormSubmitted = signal(false);
  passwordRegex = PASSWORD_REGEX;

  resetPasswordForm: ResetPasswordFormGroupType = this.fb.group(
    {
      newPassword: ['', [CustomValidators.requiredTrimmed(), Validators.pattern(this.passwordRegex)]],
      confirmNewPassword: ['', CustomValidators.requiredTrimmed()],
    },
    {
      validators: CustomValidators.passwordMatchValidator('newPassword', 'confirmNewPassword'),
    }
  );

  get isNewPasswordError() {
    return this.resetPasswordForm.get('newPassword')?.errors && this.resetPasswordForm.get('newPassword')?.touched;
  }

  get isMismatchError(): boolean {
    return (
      this.resetPasswordForm.get('confirmNewPassword')?.dirty &&
      this.resetPasswordForm.get('newPassword')?.dirty &&
      this.resetPasswordForm.errors?.['passwordMismatch']
    );
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isFormSubmitted.set(true);
  }
}
