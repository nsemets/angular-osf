import { Store } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { ToolbarResource } from '@osf/shared/models/toolbar-resource.model';
import { ToastService } from '@osf/shared/services/toast.service';

import { ForkResource, ProjectOverviewSelectors } from '../../store';

import { ForkDialogComponent } from './fork-dialog.component';

import { DynamicDialogRefMock } from '@testing/mocks/dynamic-dialog-ref.mock';
import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('ForkDialogComponent', () => {
  let component: ForkDialogComponent;
  let fixture: ComponentFixture<ForkDialogComponent>;
  let store: jest.Mocked<Store>;
  let dialogRef: jest.Mocked<DynamicDialogRef>;
  let dialogConfig: jest.Mocked<DynamicDialogConfig>;
  let toastService: jest.Mocked<ToastService>;

  const mockResource: ToolbarResource = {
    id: 'resource-123',
    title: 'Test Resource',
    isPublic: true,
    viewOnlyLinksCount: 0,
    forksCount: 0,
    resourceType: ResourceType.Project,
    isAnonymous: false,
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    dialogRef = DynamicDialogRefMock.useValue as unknown as jest.Mocked<DynamicDialogRef>;
    dialogConfig = {
      data: { resource: mockResource },
    } as jest.Mocked<DynamicDialogConfig>;
    toastService = { showSuccess: jest.fn() } as unknown as jest.Mocked<ToastService>;

    await TestBed.configureTestingModule({
      imports: [ForkDialogComponent, OSFTestingModule],
      providers: [
        DynamicDialogRefMock,
        MockProvider(DynamicDialogConfig, dialogConfig),
        MockProvider(ToastService, toastService),
        provideMockStore({
          signals: [{ selector: ProjectOverviewSelectors.getForkProjectSubmitting, value: false }],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store) as jest.Mocked<Store>;
    store.dispatch = jest.fn().mockReturnValue(of(true));
    fixture = TestBed.createComponent(ForkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should dispatch ForkResource action with resource id and type', () => {
    component.handleForkConfirm();

    expect(store.dispatch).toHaveBeenCalledWith(expect.any(ForkResource));
    const call = (store.dispatch as jest.Mock).mock.calls.find((call) => call[0] instanceof ForkResource);
    expect(call).toBeDefined();
    const action = call[0] as ForkResource;
    expect(action.resourceId).toBe('resource-123');
    expect(action.resourceType).toBe(ResourceType.Project);
  });

  it('should close dialog with success data on finalize', () => {
    store.dispatch = jest.fn().mockReturnValue(of(true));

    component.handleForkConfirm();
    jest.runAllTimers();

    expect(dialogRef.close).toHaveBeenCalledWith({ success: true });
  });

  it('should show success toast on finalize', () => {
    store.dispatch = jest.fn().mockReturnValue(of(true));

    component.handleForkConfirm();
    jest.runAllTimers();

    expect(toastService.showSuccess).toHaveBeenCalledWith('project.overview.dialog.toast.fork.success');
  });

  it('should have config injected', () => {
    expect(component.config).toBeDefined();
    expect(component.config.data.resource).toEqual(mockResource);
  });

  it('should have dialogRef injected', () => {
    expect(component.dialogRef).toBeDefined();
  });

  it('should have isSubmitting selector', () => {
    expect(component.isSubmitting).toBeDefined();
  });
});
