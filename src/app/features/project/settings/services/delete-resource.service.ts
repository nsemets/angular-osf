import { createDispatchMap, select } from '@ngxs/store';

import { catchError, EMPTY, filter, finalize, switchMap, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DeleteComponentDialogComponent } from '@osf/features/project/overview/components/delete-component-dialog/delete-component-dialog.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { CurrentResourceSelectors, GetResourceWithChildren } from '@osf/shared/stores/current-resource';

import { DeleteProjectDialogComponent } from '../components/delete-project-dialog/delete-project-dialog.component';
import { DeleteResourceBaseOptions, DeleteResourceRunConfig } from '../models/delete-resource-options.model';
import { DeleteProject } from '../store/settings.actions';

@Injectable({ providedIn: 'root' })
export class DeleteResourceService {
  private readonly customDialogService = inject(CustomDialogService);
  private readonly loaderService = inject(LoaderService);
  private readonly toastService = inject(ToastService);

  private readonly resourcesToDelete = select(CurrentResourceSelectors.getResourceWithChildren);

  private readonly actions = createDispatchMap({
    getResourceWithChildren: GetResourceWithChildren,
    deleteProject: DeleteProject,
  });

  deleteComponent(options: DeleteResourceBaseOptions): void {
    this.run({
      ...options,
      dialogComponent: DeleteComponentDialogComponent,
      dialogHeader: 'project.overview.dialog.deleteComponent.header',
      dialogWidth: '650px',
      toastKey: 'project.overview.dialog.toast.deleteComponent.success',
    });
  }

  deleteProject(options: DeleteResourceBaseOptions): void {
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
      resourceType = ResourceType.Project,
      destroyRef,
      onSuccess,
      dialogComponent,
      dialogHeader,
      dialogWidth,
      toastKey,
    } = config;

    this.actions
      .getResourceWithChildren(rootParentId, resourceId, resourceType)
      .pipe(
        tap({ subscribe: () => this.loaderService.show() }),
        finalize(() => this.loaderService.hide()),
        switchMap(() =>
          this.customDialogService
            .open(dialogComponent, {
              header: dialogHeader,
              width: dialogWidth,
            })
            .onClose.pipe(filter((confirmed: boolean) => !!confirmed))
        ),
        tap(() => this.loaderService.show()),
        switchMap(() =>
          this.actions.deleteProject(this.resourcesToDelete()).pipe(finalize(() => this.loaderService.hide()))
        ),
        catchError(() => EMPTY),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.toastService.showSuccess(toastKey);
        onSuccess();
      });
  }
}
