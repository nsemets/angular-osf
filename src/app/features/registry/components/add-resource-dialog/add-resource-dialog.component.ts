import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { finalize, take } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { ResourceFormComponent } from '@osf/features/registry/components';
import { resourceTypeOptions } from '@osf/features/registry/constants';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { ConfirmAddResource } from '@osf/features/registry/models/resources/confirm-add-resource.model';
import {
  ConfirmAddRegistryResource,
  PreviewRegistryResource,
  RegistryResourcesSelectors,
  SilentDelete,
} from '@osf/features/registry/store/registry-resources';
import { LoadingSpinnerComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { RegistryResourceType } from '@shared/enums';
import { SelectOption } from '@shared/models';

export const doiValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const DOIRegex = /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&'<>])\S))\b/; // value for example: 10.1234/abcd1234 or https://doi.org/10.1234/abcd1234
  const isValid = DOIRegex.test(value);
  return isValid ? null : { invalidDoi: true };
};

@Component({
  selector: 'osf-add-resource-dialog',
  imports: [Button, TranslatePipe, ReactiveFormsModule, LoadingSpinnerComponent, ResourceFormComponent],
  templateUrl: './add-resource-dialog.component.html',
  styleUrl: './add-resource-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddResourceDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  protected readonly currentResource = select(RegistryResourcesSelectors.getCurrentResource);
  protected readonly isCurrentResourceLoading = select(RegistryResourcesSelectors.isCurrentResourceLoading);
  private translateService = inject(TranslateService);

  private dialogConfig = inject(DynamicDialogConfig);
  private registryId: string = this.dialogConfig.data.id;

  protected inputLimits = InputLimits;
  protected isResourceConfirming = signal(false);

  protected form = new FormGroup({
    pid: new FormControl<string | null>('', [Validators.required, doiValidator]),
    resourceType: new FormControl<string | null>('', [Validators.required]),
    description: new FormControl<string | null>(''),
  });

  private readonly actions = createDispatchMap({
    previewResource: PreviewRegistryResource,
    confirmAddResource: ConfirmAddRegistryResource,
    deleteResource: SilentDelete,
  });

  public resourceOptions = signal<SelectOption[]>(resourceTypeOptions);
  public isPreviewMode = signal<boolean>(false);

  protected readonly RegistryResourceType = RegistryResourceType;

  previewResource(): void {
    if (this.form.invalid) {
      return;
    }

    const addResource: AddResource = {
      pid: this.form.controls['pid'].value ?? '',
      resource_type: this.form.controls['resourceType'].value ?? '',
      description: this.form.controls['description'].value ?? '',
    };

    const currentResource = this.currentResource();
    if (!currentResource) {
      throw new Error(this.translateService.instant('resources.errors.noCurrentResource'));
    }

    this.actions.previewResource(currentResource.id, addResource).subscribe(() => {
      this.isPreviewMode.set(true);
    });
  }

  backToEdit() {
    this.isPreviewMode.set(false);
  }

  onAddResource() {
    const addResource: ConfirmAddResource = {
      finalized: true,
    };
    const currentResource = this.currentResource();

    if (!currentResource) {
      throw new Error(this.translateService.instant('resources.errors.noRegistryId'));
    }

    this.isResourceConfirming.set(true);
    this.actions
      .confirmAddResource(addResource, currentResource.id, this.registryId)
      .pipe(
        take(1),
        finalize(() => {
          this.dialogRef.close(true);
          this.isResourceConfirming.set(false);
        })
      )
      .subscribe({});
  }

  closeDialog(): void {
    this.dialogRef.close();
    const currentResource = this.currentResource();
    if (!currentResource) {
      throw new Error(this.translateService.instant('resources.errors.noRegistryId'));
    }
    this.actions.deleteResource(currentResource.id);
  }
}
