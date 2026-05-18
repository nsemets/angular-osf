import { Store } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { of, Subject, throwError } from 'rxjs';

import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DeleteProject } from '@osf/features/project/settings/store';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { NodeShortInfoModel } from '@osf/shared/models/nodes/node-with-children.model';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { CurrentResourceSelectors, GetResourceWithChildren } from '@osf/shared/stores/current-resource';

import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { LoaderServiceMock, provideLoaderServiceMock } from '@testing/providers/loader-service.mock';
import { provideMockStore } from '@testing/providers/store-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import { DeleteComponentDialogComponent } from '../../features/project/overview/components/delete-component-dialog/delete-component-dialog.component';
import { DeleteProjectDialogComponent } from '../../features/project/settings/components/delete-project-dialog/delete-project-dialog.component';

import { DeleteResourceService } from './delete-resource.service';

const rootParentId = 'root-1';
const resourceId = 'node-1';
const resourceType = ResourceType.Project;

const resourcesToDelete: NodeShortInfoModel[] = [
  {
    id: 'project-123',
    title: 'Test Project',
    isPublic: true,
    permissions: [UserPermissions.Admin],
  },
];

const destroyRef = { onDestroy: vi.fn() } as unknown as DestroyRef;

const baseOptions = {
  rootParentId,
  resourceId,
  resourceType,
  destroyRef,
};

describe('DeleteResourceService', () => {
  let service: DeleteResourceService;
  let store: Store;
  let loaderService: LoaderServiceMock;
  let toastService: ToastServiceMockType;
  let customDialogService: ReturnType<CustomDialogServiceMockBuilder['build']>;
  let dialogClose$: Subject<boolean | undefined>;

  beforeEach(() => {
    dialogClose$ = new Subject();
    loaderService = new LoaderServiceMock();
    toastService = ToastServiceMock.simple();
    customDialogService = CustomDialogServiceMockBuilder.create()
      .withOpen(
        vi.fn().mockReturnValue({
          onClose: dialogClose$,
          close: vi.fn(),
        })
      )
      .build();

    TestBed.configureTestingModule({
      providers: [
        DeleteResourceService,
        provideLoaderServiceMock(loaderService),
        MockProvider(CustomDialogService, customDialogService),
        MockProvider(ToastService, toastService),
        provideMockStore({
          selectors: [
            {
              selector: CurrentResourceSelectors.getResourceWithChildren,
              value: resourcesToDelete,
            },
          ],
          actions: [
            {
              action: new GetResourceWithChildren(rootParentId, resourceId, resourceType),
              value: undefined,
            },
            {
              action: new DeleteProject(resourcesToDelete),
              value: undefined,
            },
          ],
        }),
      ],
    });

    service = TestBed.inject(DeleteResourceService);
    store = TestBed.inject(Store);
  });

  it('should load tree, open component dialog, delete, toast, and call onSuccess', () => {
    const onSuccess = vi.fn();

    service.deleteComponent({ ...baseOptions, onSuccess });

    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new GetResourceWithChildren(rootParentId, resourceId, resourceType));
    expect(customDialogService.open).toHaveBeenCalledWith(DeleteComponentDialogComponent, {
      header: 'project.overview.dialog.deleteComponent.header',
      width: '650px',
    });

    dialogClose$.next(true);

    expect(store.dispatch).toHaveBeenCalledWith(new DeleteProject(resourcesToDelete));
    expect(toastService.showSuccess).toHaveBeenCalledWith('project.overview.dialog.toast.deleteComponent.success');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should load tree, open project dialog, delete, toast, and call onSuccess', () => {
    const onSuccess = vi.fn();

    service.deleteProject({ ...baseOptions, onSuccess });

    expect(customDialogService.open).toHaveBeenCalledWith(DeleteProjectDialogComponent, {
      header: 'project.deleteProject.dialog.deleteProject',
      width: '500px',
    });

    dialogClose$.next(true);

    expect(toastService.showSuccess).toHaveBeenCalledWith('project.deleteProject.success');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should hide loader when loading tree fails', () => {
    vi.mocked(store.dispatch).mockReturnValue(throwError(() => new Error('load failed')));

    service.deleteComponent({ ...baseOptions, onSuccess: vi.fn() });

    expect(loaderService.show).toHaveBeenCalled();
    expect(loaderService.hide).toHaveBeenCalled();
    expect(customDialogService.open).not.toHaveBeenCalled();
  });

  it('should not delete or toast when dialog is cancelled', () => {
    const onSuccess = vi.fn();

    service.deleteComponent({ ...baseOptions, onSuccess });

    dialogClose$.next(false);

    expect(store.dispatch).not.toHaveBeenCalledWith(new DeleteProject(resourcesToDelete));
    expect(toastService.showSuccess).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should hide loader when delete fails', () => {
    vi.mocked(store.dispatch)
      .mockReturnValueOnce(of(undefined))
      .mockReturnValueOnce(throwError(() => new Error('delete failed')));

    const onSuccess = vi.fn();

    service.deleteProject({ ...baseOptions, onSuccess });

    dialogClose$.next(true);

    expect(toastService.showSuccess).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(loaderService.hide).toHaveBeenCalled();
  });
});
