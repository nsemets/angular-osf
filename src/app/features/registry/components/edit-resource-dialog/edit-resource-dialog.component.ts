import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Textarea } from 'primeng/textarea';

import { finalize, take } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Primitive } from '@core/helpers';
import { resourceTypeOptions } from '@osf/features/registry/constants/resource-type-options.constant';
import { RegistryResource } from '@osf/features/registry/models';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { AddResourceRequest } from '@osf/features/registry/models/resources/add-resource-request.model';
import { RegistryResourcesSelectors, UpdateResource } from '@osf/features/registry/store/registry-resources';
import { LoadingSpinnerComponent, SelectComponent, TextInputComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { RegistryResourceType } from '@shared/enums';
import { SelectOption } from '@shared/models';

@Component({
  selector: 'osf-edit-resource-dialog',
  imports: [
    LoadingSpinnerComponent,
    TextInputComponent,
    SelectComponent,
    Textarea,
    ReactiveFormsModule,
    Button,
    TranslatePipe,
  ],
  templateUrl: './edit-resource-dialog.component.html',
  styleUrl: './edit-resource-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditResourceDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  protected readonly isCurrentResourceLoading = select(RegistryResourcesSelectors.isCurrentResourceLoading);

  private dialogConfig = inject(DynamicDialogConfig);
  private registryId: string = this.dialogConfig.data.id;
  private resource: RegistryResource = this.dialogConfig.data.resource as RegistryResource;
  protected inputLimits = InputLimits;
  public selectedResourceType = signal<RegistryResourceType | null>(null);
  public resourceOptions = signal<SelectOption[]>(resourceTypeOptions);

  protected form = new FormGroup({
    pid: new FormControl('', [Validators.required]),
    resourceType: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  private readonly actions = createDispatchMap({
    updateResource: UpdateResource,
  });

  constructor() {
    this.form.patchValue({
      pid: this.resource.pid || '',
      resourceType: this.resource.type || '',
      description: this.resource.description || '',
    });

    this.selectedResourceType.set(this.resource.type || null);
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const addResource: AddResource = {
      pid: this.form.controls['pid'].value ?? '',
      resource_type: this.form.controls['resourceType'].value ?? '',
      description: this.form.controls['description'].value ?? '',
    };

    if (!this.resource.id) {
      throw new Error('No current resource id.');
    }

    const request: AddResourceRequest<AddResource> = {
      attributes: addResource,
      id: this.resource.id,
      relationships: {},
      type: 'resources',
    };

    this.actions
      .updateResource(this.registryId, request)
      .pipe(
        take(1),
        finalize(() => {
          this.dialogRef.close(true);
        })
      )
      .subscribe();
  }
  changeType($event: Primitive) {
    this.form.patchValue({
      resourceType: $event?.toString(),
    });
  }
}
