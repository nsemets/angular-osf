import { MockComponents, MockProvider } from 'ng-mocks';

import { of, Subject } from 'rxjs';

import { HttpEventType } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistriesSelectors } from '@osf/features/registries/store';
import { FileUploadDialogComponent } from '@osf/shared/components/file-upload-dialog/file-upload-dialog.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { FILE_SIZE_LIMIT } from '@osf/shared/constants/files-limits.const';
import { FileModel } from '@osf/shared/models/files/file.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { FilesControlComponent } from './files-control.component';

import { OSFTestingModule } from '@testing/osf.testing.module';
import { CustomConfirmationServiceMockBuilder } from '@testing/providers/custom-confirmation-provider.mock';
import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { provideMockStore } from '@testing/providers/store-provider.mock';
import { ToastServiceMockBuilder } from '@testing/providers/toast-provider.mock';

describe('FilesControlComponent', () => {
  let component: FilesControlComponent;
  let fixture: ComponentFixture<FilesControlComponent>;
  let mockFilesService: jest.Mocked<FilesService>;
  let mockDialogService: ReturnType<CustomDialogServiceMockBuilder['build']>;
  let mockToastService: ReturnType<ToastServiceMockBuilder['build']>;
  let mockCustomConfirmationService: ReturnType<CustomConfirmationServiceMockBuilder['build']>;

  const currentFolder = {
    links: { newFolder: '/new-folder', upload: '/upload', filesLink: '/files-link' },
  } as FileFolderModel;

  beforeEach(async () => {
    mockFilesService = { uploadFile: jest.fn(), getFileGuid: jest.fn() } as any;
    mockDialogService = CustomDialogServiceMockBuilder.create().withDefaultOpen().build();
    mockToastService = ToastServiceMockBuilder.create().build();
    mockCustomConfirmationService = CustomConfirmationServiceMockBuilder.create().build();

    await TestBed.configureTestingModule({
      imports: [
        FilesControlComponent,
        OSFTestingModule,
        ...MockComponents(LoadingSpinnerComponent, FileUploadDialogComponent),
      ],
      providers: [
        MockProvider(FilesService, mockFilesService),
        MockProvider(CustomDialogService, mockDialogService),
        MockProvider(ToastService, mockToastService),
        MockProvider(CustomConfirmationService, mockCustomConfirmationService),
        provideMockStore({
          signals: [
            { selector: RegistriesSelectors.getFiles, value: [] },
            { selector: RegistriesSelectors.getFilesTotalCount, value: 0 },
            { selector: RegistriesSelectors.isFilesLoading, value: false },
            { selector: RegistriesSelectors.getCurrentFolder, value: currentFolder },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesControlComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('attachedFiles', []);
    fixture.componentRef.setInput('filesLink', '/files-link');
    fixture.componentRef.setInput('projectId', 'project-1');
    fixture.componentRef.setInput('provider', 'provider-1');
    fixture.componentRef.setInput('filesViewOnly', false);
    fixture.detectChanges();
  });

  it('should create with default signal values', () => {
    expect(component).toBeTruthy();
    expect(component.fileIsUploading()).toBe(false);
    expect(component.progress()).toBe(0);
    expect(component.fileName()).toBe('');
  });

  it('should do nothing when no file is selected', () => {
    const event = { target: { files: [] } } as any;
    const uploadSpy = jest.spyOn(component, 'uploadFiles');

    component.onFileSelected(event);

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  it('should show warning when file exceeds size limit', () => {
    const oversizedFile = new File([''], 'big.bin');
    Object.defineProperty(oversizedFile, 'size', { value: FILE_SIZE_LIMIT });
    const event = { target: { files: [oversizedFile] } } as any;

    component.onFileSelected(event);

    expect(mockToastService.showWarn).toHaveBeenCalledWith('shared.files.limitText');
  });

  it('should upload valid file', () => {
    const file = new File(['data'], 'test.txt');
    const event = { target: { files: [file] } } as any;
    const uploadSpy = jest.spyOn(component, 'uploadFiles').mockImplementation();

    component.onFileSelected(event);

    expect(uploadSpy).toHaveBeenCalledWith(file);
  });

  it('should open dialog and dispatch createFolder action on confirm', () => {
    const onClose$ = new Subject<string>();
    (mockDialogService.open as any).mockReturnValue({ onClose: onClose$ });
    const mockActions = { createFolder: jest.fn().mockReturnValue(of({})) };
    Object.defineProperty(component, 'actions', { value: mockActions });

    component.createFolder();

    expect(mockDialogService.open).toHaveBeenCalled();
    onClose$.next('New Folder');
    expect(mockActions.createFolder).toHaveBeenCalledWith('/new-folder', 'New Folder');
  });

  it('should upload file, track progress, and select uploaded file', () => {
    const file = new File(['data'], 'test.txt');
    const progress = { type: HttpEventType.UploadProgress, loaded: 50, total: 100 } as any;
    const response = { type: HttpEventType.Response, body: { data: { id: 'files/abc' } } } as any;

    mockFilesService.uploadFile.mockReturnValue(of(progress, response));
    mockFilesService.getFileGuid.mockReturnValue(of({ id: 'abc' } as FileModel));

    const selectSpy = jest.spyOn(component, 'selectFile');

    component.uploadFiles(file);

    expect(mockFilesService.uploadFile).toHaveBeenCalledWith(file, '/upload');
    expect(component.progress()).toBe(50);
    expect(selectSpy).toHaveBeenCalledWith({ id: 'abc' } as FileModel);
  });

  it('should not upload when no upload link', () => {
    const noLinkFolder = { links: {} } as FileFolderModel;
    Object.defineProperty(component, 'currentFolder', { value: () => noLinkFolder });

    const file = new File(['data'], 'test.txt');
    component.uploadFiles(file);

    expect(mockFilesService.uploadFile).not.toHaveBeenCalled();
  });

  it('should handle File array input', () => {
    const file = new File(['data'], 'test.txt');
    mockFilesService.uploadFile.mockReturnValue(of({ type: HttpEventType.Sent } as any));

    component.uploadFiles([file]);

    expect(mockFilesService.uploadFile).toHaveBeenCalledWith(file, '/upload');
  });

  it('should emit attachFile when not view-only', (done) => {
    const file = { id: 'file-1' } as FileModel;
    component.attachFile.subscribe((f) => {
      expect(f).toEqual(file);
      done();
    });
    component.selectFile(file);
  });

  it('should not emit attachFile when filesViewOnly is true', () => {
    fixture.componentRef.setInput('filesViewOnly', true);
    fixture.detectChanges();

    const emitSpy = jest.spyOn(component.attachFile, 'emit');
    component.selectFile({ id: 'file-1' } as any);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should dispatch getFiles on onLoadFiles', () => {
    const mockActions = { getFiles: jest.fn() };
    Object.defineProperty(component, 'actions', { value: mockActions });

    component.onLoadFiles({ link: '/files', page: 2 });

    expect(mockActions.getFiles).toHaveBeenCalledWith('/files', 2);
  });

  it('should dispatch setCurrentFolder', () => {
    const folder = { id: 'folder-1' } as FileFolderModel;
    const mockActions = { setCurrentFolder: jest.fn() };
    Object.defineProperty(component, 'actions', { value: mockActions });

    component.setCurrentFolder(folder);

    expect(mockActions.setCurrentFolder).toHaveBeenCalledWith(folder);
  });
});
