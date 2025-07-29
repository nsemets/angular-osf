import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Textarea } from 'primeng/textarea';

import { finalize, take } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { resourceTypeOptions } from '@osf/features/registry/constants';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { ConfirmAddResource } from '@osf/features/registry/models/resources/confirm-add-resource.model';
import {
  ConfirmAddRegistryResource,
  PreviewRegistryResource,
  RegistryResourcesSelectors,
} from '@osf/features/registry/store/registry-resources';
import { FormSelectComponent, LoadingSpinnerComponent, TextInputComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { RegistryResourceType } from '@shared/enums';
import { SelectOption } from '@shared/models';

@Component({
  selector: 'osf-add-resource-dialog',
  imports: [
    Button,
    TextInputComponent,
    TranslatePipe,
    ReactiveFormsModule,
    Textarea,
    LoadingSpinnerComponent,
    FormSelectComponent,
  ],
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
    pid: new FormControl('', [Validators.required]),
    resourceType: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  private readonly actions = createDispatchMap({
    previewResource: PreviewRegistryResource,
    confirmAddResource: ConfirmAddRegistryResource,
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
}
