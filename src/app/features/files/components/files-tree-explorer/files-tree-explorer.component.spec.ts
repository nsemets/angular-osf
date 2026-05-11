import { MockComponents, MockProvider } from 'ng-mocks';

import { TreeDragDropService } from 'primeng/api';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileMenuComponent } from '@osf/shared/components/file-menu/file-menu.component';
import { FilesDropZoneComponent } from '@osf/shared/components/files-drop-zone/files-drop-zone.component';
import { FilesTreeRowComponent } from '@osf/shared/components/files-tree-row/files-tree-row.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { FileLabelModel } from '@osf/shared/models/files/file-label.model';

import { OSF_FILE_MOCK } from '@testing/mocks/osf-file.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

import { FilesTreeExplorerComponent } from './files-tree-explorer.component';

describe.skip('FilesTreeExplorerComponent', () => {
  let component: FilesTreeExplorerComponent;
  let fixture: ComponentFixture<FilesTreeExplorerComponent>;

  const mockFolderFile: FileFolderModel = {
    ...OSF_FILE_MOCK,
    kind: FileKind.Folder,
    name: 'Test Folder',
  };

  const mockStorage: FileLabelModel = {
    label: 'OSF Storage',
    folder: mockFolderFile,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FilesTreeExplorerComponent,
        ...MockComponents(LoadingSpinnerComponent, FilesDropZoneComponent, FilesTreeRowComponent, FileMenuComponent),
      ],
      providers: [provideOSFCore(), MockProvider(TreeDragDropService)],
    });

    fixture = TestBed.createComponent(FilesTreeExplorerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('files', []);
    fixture.componentRef.setInput('currentFolder', null);
    fixture.componentRef.setInput('storage', mockStorage);
    fixture.componentRef.setInput('resourceId', 'resource-123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all required inputs', () => {
    expect(component.files()).toEqual([]);
    expect(component.currentFolder()).toBe(null);
    expect(component.storage()).toEqual(mockStorage);
  });
});
