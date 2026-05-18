import { Store } from '@ngxs/store';

import { filter, finalize, switchMap } from 'rxjs';

import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DeleteComponentDialogComponent } from '@osf/features/project/overview/components/delete-component-dialog/delete-component-dialog.component';
import { DeleteProjectDialogComponent } from '@osf/features/project/settings/components/delete-project-dialog/delete-project-dialog.component';
import { DeleteProject } from '@osf/features/project/settings/store';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { CurrentResourceSelectors, GetResourceWithChildren } from '@osf/shared/stores/current-resource';

import {
  DeleteComponentOptions,
  DeleteProjectOptions,
  DeleteResourceRunConfig,
} from '../models/delete-resource-options.model';

@Injectable({ providedIn: 'root' })
export class DeleteResourceService {
  private readonly store = inject(Store);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);

  deleteComponent(options: DeleteComponentOptions): void {
    this.run({
      ...options,
      dialogComponent: DeleteComponentDialogComponent,
      dialogHeader: 'project.overview.dialog.deleteComponent.header',
      dialogWidth: '650px',
      toastKey: 'project.overview.dialog.toast.deleteComponent.success',
    });
  }

  deleteProject(options: DeleteProjectOptions): void {
    this.run({
      ...options,
      dialogComponent: DeleteProjectDialogComponent,
      dialogHeader: 'project.deleteProject.dialog.deleteProject',
      dialogWidth: '500px',
      toastKey: 'project.deleteProject.success',
    });
  }

  private run(config: DeleteResourceRunConfig): void {
    const {
      rootParentId,
      resourceId,
      resourceType,
      destroyRef,
      onSuccess,
      dialogComponent,
      dialogHeader,
      dialogWidth,
      toastKey,
    } = config;

    this.loaderService.show();

    this.store.dispatch(new GetResourceWithChildren(rootParentId, resourceId, resourceType)).subscribe({
      next: () => {
        this.loaderService.hide();

        this.customDialogService
          .open(dialogComponent, {
            header: dialogHeader,
            width: dialogWidth,
          })
          .onClose.pipe(
            filter((confirmed: boolean) => !!confirmed),
            takeUntilDestroyed(destroyRef),
            switchMap(() => {
              this.loaderService.show();
              const resourcesToDelete = this.store.selectSnapshot(CurrentResourceSelectors.getResourceWithChildren);
              return this.store
                .dispatch(new DeleteProject(resourcesToDelete))
                .pipe(finalize(() => this.loaderService.hide()));
            })
          )
          .subscribe({
            next: () => {
              this.toastService.showSuccess(toastKey);
              onSuccess();
            },
            error: () => undefined,
          });
      },
      error: () => this.loaderService.hide(),
    });
  }
}
