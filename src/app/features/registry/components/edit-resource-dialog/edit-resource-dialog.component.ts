import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Textarea } from 'primeng/textarea';

import { finalize, take } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { resourceTypeOptions } from '@osf/features/registry/constants';
import { RegistryResource } from '@osf/features/registry/models';
import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { RegistryResourcesSelectors, UpdateResource } from '@osf/features/registry/store/registry-resources';
import { FormSelectComponent, LoadingSpinnerComponent, TextInputComponent } from '@shared/components';
import { InputLimits } from '@shared/constants';
import { SelectOption } from '@shared/models';

@Component({
  selector: 'osf-edit-resource-dialog',
  imports: [
    LoadingSpinnerComponent,
    TextInputComponent,
    Textarea,
    ReactiveFormsModule,
    Button,
    TranslatePipe,
    FormSelectComponent,
  ],
  templateUrl: './edit-resource-dialog.component.html',
  styleUrl: './edit-resource-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditResourceDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  protected readonly isCurrentResourceLoading = select(RegistryResourcesSelectors.isCurrentResourceLoading);
  private translateService = inject(TranslateService);

  private dialogConfig = inject(DynamicDialogConfig);
  private registryId: string = this.dialogConfig.data.id;
  private resource: RegistryResource = this.dialogConfig.data.resource as RegistryResource;
  protected inputLimits = InputLimits;
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
      throw new Error(this.translateService.instant('resources.errors.noRegistryId'));
    }

    this.actions
      .updateResource(this.registryId, this.resource.id, addResource)
      .pipe(
        take(1),
        finalize(() => {
          this.dialogRef.close(true);
        })
      )
      .subscribe();
  }
}
