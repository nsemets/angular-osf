import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';

import { UpdateProfileSettingsUser, UserSelectors } from '@osf/core/store/user';
import { forbiddenFileNameCharacters } from '@osf/shared/constants/input-limits.const';
import { CustomValidators } from '@osf/shared/helpers/custom-form-validators.helper';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { UserModel } from '@shared/models/user/user.models';

import { hasNameChanges } from '../../helpers';
import { NameForm } from '../../models';
import { CitationPreviewComponent } from '../citation-preview/citation-preview.component';
import { NameFormComponent } from '../name-form/name-form.component';

@Component({
  selector: 'osf-name',
  imports: [Button, TranslatePipe, CitationPreviewComponent, NameFormComponent],
  templateUrl: './name.component.html',
  styleUrl: './name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameComponent {
  @HostBinding('class') classes = 'flex flex-column gap-4 flex-1';

  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly customConfirmationService = inject(CustomConfirmationService);

  readonly actions = createDispatchMap({ updateProfileSettingsUser: UpdateProfileSettingsUser });
  readonly currentUser = select(UserSelectors.getUserNames);
  readonly previewUser = signal<Partial<UserModel>>({});

  readonly fb = inject(FormBuilder);
  readonly form = this.fb.group<NameForm>({
    fullName: this.fb.control('', {
      nonNullable: true,
      validators: [
        CustomValidators.requiredTrimmed(),
        CustomValidators.forbiddenCharactersValidator(forbiddenFileNameCharacters),
      ],
    }),
    givenName: this.fb.control('', {
      nonNullable: true,
      validators: CustomValidators.forbiddenCharactersValidator(forbiddenFileNameCharacters),
    }),
    middleNames: this.fb.control('', {
      nonNullable: true,
      validators: CustomValidators.forbiddenCharactersValidator(forbiddenFileNameCharacters),
    }),
    familyName: this.fb.control('', {
      nonNullable: true,
      validators: CustomValidators.forbiddenCharactersValidator(forbiddenFileNameCharacters),
    }),
    suffix: this.fb.control('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();

      if (!user) {
        return;
      }

      this.updateForm(user);
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updatePreviewUser();
    });
  }

  saveChanges() {
    if (this.form.invalid) {
      return;
    }

    const { fullName, givenName, middleNames, familyName, suffix } = this.form.getRawValue();

    this.loaderService.show();
    this.actions
      .updateProfileSettingsUser({
        fullName,
        givenName,
        middleNames,
        familyName,
        suffix,
      })
      .subscribe(() => {
        this.loaderService.hide();
        this.toastService.showSuccess('settings.profileSettings.name.successUpdate');
      });
  }

  discardChanges() {
    if (!this.hasFormChanges()) {
      return;
    }

    this.customConfirmationService.confirmDelete({
      headerKey: 'common.discardChangesDialog.header',
      messageKey: 'common.discardChangesDialog.message',
      acceptLabelKey: 'common.buttons.discardChanges',
      onConfirm: () => {
        const user = this.currentUser();
        if (user) {
          this.updateForm(user);
          this.toastService.showSuccess('settings.profileSettings.changesDiscarded');
        }
      },
    });
  }

  hasFormChanges(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    return hasNameChanges(this.form.controls, user);
  }

  private updateForm(user: Partial<UserModel>) {
    this.form.patchValue({
      fullName: user.fullName,
      givenName: user.givenName,
      middleNames: user.middleNames,
      familyName: user.familyName,
      suffix: user.suffix,
    });
  }

  private updatePreviewUser() {
    const formValues = this.form.getRawValue();
    const currentUserValue = this.currentUser();

    this.previewUser.set({
      ...currentUserValue,
      ...formValues,
    });
  }
}
