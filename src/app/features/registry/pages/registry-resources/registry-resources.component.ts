import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

import { ChangeDetectionStrategy, Component, HostBinding, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AddResourceDialogComponent } from '@osf/features/registry/components/add-resource-dialog/add-resource-dialog.component';
import {
  AddRegistryResource,
  GetRegistryResources,
  RegistryResourcesSelectors,
} from '@osf/features/registry/store/registry-resources';
import { LoadingSpinnerComponent, SubHeaderComponent } from '@shared/components';
import { ToastService } from '@shared/services';

@Component({
  selector: 'osf-registry-resources',
  imports: [SubHeaderComponent, TranslatePipe, Button, LoadingSpinnerComponent],
  templateUrl: './registry-resources.component.html',
  styleUrl: './registry-resources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class RegistryResourcesComponent {
  @HostBinding('class') classes = 'flex-1 flex flex-column w-full h-full';
  private readonly route = inject(ActivatedRoute);
  private dialogService = inject(DialogService);
  private translateService = inject(TranslateService);
  private toastService = inject(ToastService);

  protected readonly resources = select(RegistryResourcesSelectors.getResources);
  protected readonly isResourcesLoading = select(RegistryResourcesSelectors.isResourcesLoading);
  private registryId = '';

  private readonly actions = createDispatchMap({
    getResources: GetRegistryResources,
    addResource: AddRegistryResource,
  });

  constructor() {
    this.route.parent?.params.subscribe((params) => {
      this.registryId = params['id'];
      if (this.registryId) {
        this.actions.getResources(this.registryId);
      }
    });
  }

  addResource() {
    const dialogRef = this.dialogService.open(AddResourceDialogComponent, {
      header: this.translateService.instant('resource.add'),
      width: '500px',
      focusOnShow: false,
      closeOnEscape: true,
      modal: true,
      closable: true,
      data: { id: this.registryId },
    });

    dialogRef.onClose.subscribe({
      next: () => {
        this.toastService.showSuccess(this.translateService.instant('resource.toastMessages.addResourceSuccess'));
      },
      error: () =>
        this.toastService.showError(this.translateService.instant('resource.toastMessages.addResourceError')),
    });
  }
}
