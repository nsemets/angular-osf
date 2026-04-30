import { MockProvider } from 'ng-mocks';

import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { CustomConfirmationServiceMock } from '@testing/providers/custom-confirmation-provider.mock';
import { provideDynamicDialogRefMock } from '@testing/providers/dynamic-dialog-ref.mock';
import { ToastServiceMock } from '@testing/providers/toast-provider.mock';

import { ConfirmMoveFileDialogComponent } from './confirm-move-file-dialog.component';

describe('ConfirmConfirmMoveFileDialogComponent', () => {
  let component: ConfirmMoveFileDialogComponent;
  let fixture: ComponentFixture<ConfirmMoveFileDialogComponent>;

  beforeEach(() => {
    const dialogConfigMock = {
      data: { files: [], destination: { name: 'files' } },
    };

    TestBed.configureTestingModule({
      imports: [ConfirmMoveFileDialogComponent],
      providers: [
        provideOSFCore(),
        provideDynamicDialogRefMock(),
        MockProvider(DynamicDialogConfig, dialogConfigMock),
        MockProvider(FilesService),
        MockProvider(ToastService, ToastServiceMock.simple()),
        MockProvider(CustomConfirmationService, CustomConfirmationServiceMock.simple()),
      ],
    });

    fixture = TestBed.createComponent(ConfirmMoveFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct properties', () => {
    expect(component.config).toBeDefined();
    expect(component.dialogRef).toBeDefined();
  });
});
