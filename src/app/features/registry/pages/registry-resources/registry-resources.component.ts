import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { filter, finalize, switchMap, take } from 'rxjs';

import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { GetResourceMetadata, MetadataSelectors } from '@osf/features/metadata/store';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { AddResourceDialogComponent, EditResourceDialogComponent } from '../../components';
import { RegistryResource } from '../../models';
import {
  AddRegistryResource,
  DeleteResource,
  GetRegistryResources,
  RegistryResourcesSelectors,
} from '../../store/registry-resources';

@Component({
  selector: 'osf-registry-resources',
  imports: [SubHeaderComponent, TranslatePipe, Button, LoadingSpinnerComponent, IconComponent],
  templateUrl: './registry-resources.component.html',
  styleUrl: './registry-resources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistryResourcesComponent {
  @HostBinding('class') classes = 'flex-1 flex flex-column w-full h-full';
  private readonly route = inject(ActivatedRoute);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly toastService = inject(ToastService);
  private readonly customConfirmationService = inject(CustomConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resources = select(RegistryResourcesSelectors.getResources);
  readonly isResourcesLoading = select(RegistryResourcesSelectors.isResourcesLoading);
  readonly currentResource = select(RegistryResourcesSelectors.getCurrentResource);
  readonly registry = select(MetadataSelectors.getResourceMetadata);

  registryId = this.route.snapshot.parent?.params['id'];
  isAddingResource = signal(false);
  doiDomain = 'https://doi.org/';

  private readonly actions = createDispatchMap({
    fetchRegistryData: GetResourceMetadata,
    getResources: GetRegistryResources,
    addResource: AddRegistryResource,
    deleteResource: DeleteResource,
  });

  canEdit = computed(() => {
    const registry = this.registry();
    if (!registry) return false;

    return registry.currentUserPermissions.includes(UserPermissions.Write);
  });

  addButtonVisible = computed(() => !!this.registry()?.identifiers?.length && this.canEdit());

  constructor() {
    this.actions.fetchRegistryData(this.registryId, ResourceType.Registration);
    this.actions.getResources(this.registryId);
  }

  addResource() {
    if (!this.registryId) return;

    this.isAddingResource.set(true);

    this.actions
      .addResource(this.registryId)
      .pipe(
        take(1),
        switchMap(() => this.openAddResourceDialog()),
        filter((res) => !!res),
        finalize(() => this.isAddingResource.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => this.toastService.showSuccess('resources.toastMessages.addResourceSuccess'),
        error: () => this.toastService.showError('resources.toastMessages.addResourceError'),
      });
  }

  openAddResourceDialog() {
    return this.customDialogService.open(AddResourceDialogComponent, {
      header: 'resources.add',
      width: '500px',
      data: { id: this.registryId },
    }).onClose;
  }

  updateResource(resource: RegistryResource) {
    if (!this.registryId) return;

    this.customDialogService
      .open(EditResourceDialogComponent, {
        header: 'resources.edit',
        width: '500px',
        data: { id: this.registryId, resource: resource },
      })
      .onClose.pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((res) => !!res)
      )
      .subscribe({
        next: () => this.toastService.showSuccess('resources.toastMessages.updatedResourceSuccess'),
        error: () => this.toastService.showError('resources.toastMessages.updateResourceError'),
      });
  }

  deleteResource(id: string) {
    if (!this.registryId) return;

    this.customConfirmationService.confirmDelete({
      headerKey: 'resources.delete',
      messageKey: 'resources.deleteText',
      acceptLabelKey: 'common.buttons.remove',
      onConfirm: () => {
        this.actions
          .deleteResource(id, this.registryId)
          .pipe(take(1))
          .subscribe(() => this.toastService.showSuccess('resources.toastMessages.deletedResourceSuccess'));
      },
    });
  }
}
