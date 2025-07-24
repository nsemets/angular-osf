import { createDispatchMap } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Primitive } from '@core/helpers';
import { resourceTypeOptions } from '@osf/features/registry/constants/resource-type-options.constant';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { AddResourceRequest } from '@osf/features/registry/models/resources/add-resource-request.model';
import { ConfirmAddResource } from '@osf/features/registry/models/resources/confirm-add-resource.model';
import { AddRegistryResource, ConfirmAddRegistryResource } from '@osf/features/registry/store/registry-resources';
import { SelectComponent, TextInputComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { RegistryResourceType } from '@shared/enums';
import { SelectOption } from '@shared/models';

@Component({
  selector: 'osf-add-resource-dialog',
  imports: [Button, TextInputComponent, TranslatePipe, ReactiveFormsModule, Textarea, SelectComponent],
  templateUrl: './add-resource-dialog.component.html',
  styleUrl: './add-resource-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddResourceDialogComponent {
  private dialogConfig = inject(DynamicDialogConfig);
  private registryId: string = this.dialogConfig.data.id;
  protected readonly dialogRef = inject(DynamicDialogRef);

  protected inputLimits = InputLimits;

  protected form = new FormGroup({
    pid: new FormControl('', [Validators.required]),
    resourceType: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  private readonly actions = createDispatchMap({
    addResource: AddRegistryResource,
    confirmAddResource: ConfirmAddRegistryResource,
  });

  public selectedResourceType = signal<RegistryResourceType | null>(null);
  public resourceOptions = signal<SelectOption[]>(resourceTypeOptions);
  public isPreviewMode = signal<boolean>(false);

  previewResource(): void {
    if (this.form.invalid) {
      return;
    }

    this.isPreviewMode.set(true);
    const addResource: AddResource = {
      pid: this.form.controls['pid'].value ?? '',
      resourceType: this.form.controls['resourceType'].value ?? '',
      description: this.form.controls['description'].value ?? '',
    };
    const request: AddResourceRequest<AddResource> = {
      attributes: addResource,
      id: this.registryId,
      relationships: {},
      type: 'resources',
    };
    this.actions.addResource(request);
  }

  backToEdit() {
    this.isPreviewMode.set(false);
  }

  onAddResource() {
    const addResource: ConfirmAddResource = {
      finalized: true,
    };
    const request: AddResourceRequest<ConfirmAddResource> = {
      attributes: addResource,
      id: this.registryId,
      relationships: {},
      type: 'resources',
    };
    this.actions.confirmAddResource(request).subscribe({
      next: () => {
        this.dialogRef.close();
      },
    });
  }

  changeType($event: Primitive) {
    this.form.patchValue({
      resourceType: $event?.toString(),
    });
  }
}
