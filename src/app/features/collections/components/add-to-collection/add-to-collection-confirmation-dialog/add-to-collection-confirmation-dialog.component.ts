import { createDispatchMap } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Observable, of, switchMap } from 'rxjs';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CreateCollectionSubmission } from '@osf/features/collections/store/add-to-collection/add-to-collection.actions';
import { CedarRecordDataBinding } from '@osf/features/metadata/models';
import { CreateCedarMetadataRecord } from '@osf/features/metadata/store';
import { UpdateProjectPublicStatus } from '@osf/features/project/overview/store';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { ToastService } from '@osf/shared/services/toast.service';

@Component({
  selector: 'osf-add-to-collection-confirmation-dialog',
  imports: [TranslatePipe, Button],
  templateUrl: './add-to-collection-confirmation-dialog.component.html',
  styleUrl: './add-to-collection-confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToCollectionConfirmationDialogComponent {
  private toastService = inject(ToastService);
  dialogRef = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  destroyRef = inject(DestroyRef);
  isSubmitting = signal<boolean>(false);
  actions = createDispatchMap({
    createCollectionSubmission: CreateCollectionSubmission,
    updateProjectPublicStatus: UpdateProjectPublicStatus,
    createCedarRecord: CreateCedarMetadataRecord,
  });

  handleAddToCollectionConfirm(): void {
    const payload = this.config.data.payload;
    const project = this.config.data.project;
    const cedarData = this.config.data.cedarData as CedarRecordDataBinding | null | undefined;

    if (!payload || !project) return;

    this.isSubmitting.set(true);
    const projectPayload = [{ id: project.id as string, public: true }];

    const updatePublicStatus$: Observable<unknown> = project.isPublic
      ? of(null)
      : this.actions.updateProjectPublicStatus(projectPayload);

    const createCedar$: Observable<unknown> = cedarData
      ? this.actions.createCedarRecord(cedarData, project.id as string, ResourceType.Project)
      : of(null);

    updatePublicStatus$
      .pipe(
        switchMap(() => createCedar$),
        switchMap(() => this.actions.createCollectionSubmission(payload)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
          this.toastService.showSuccess('collections.addToCollection.confirmationDialogToastMessage');
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }
}
