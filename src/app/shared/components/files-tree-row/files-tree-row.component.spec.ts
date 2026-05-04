import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileMenuType } from '@osf/shared/enums/file-menu-type.enum';
import { FileModel } from '@shared/models/files/file.model';
import { FileMenuFlags } from '@shared/models/files/file-menu-action.model';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { FileMenuComponent } from '../file-menu/file-menu.component';

import { FilesTreeRowComponent } from './files-tree-row.component';

describe('FilesTreeRowComponent', () => {
  let component: FilesTreeRowComponent;
  let fixture: ComponentFixture<FilesTreeRowComponent>;

  const ALL_MENU_ACTIONS: FileMenuFlags = {
    [FileMenuType.Download]: true,
    [FileMenuType.Copy]: true,
    [FileMenuType.Move]: true,
    [FileMenuType.Delete]: true,
    [FileMenuType.Rename]: true,
    [FileMenuType.Share]: true,
    [FileMenuType.Embed]: true,
  };

  function createTestFile(overrides: Partial<FileModel> = {}): FileModel {
    return {
      id: 'f1',
      guid: 'g1',
      name: 'test.pdf',
      kind: FileKind.File,
      path: '/test.pdf',
      size: 2048,
      materializedPath: '/test.pdf',
      dateModified: '2024-06-01T12:00:00.000Z',
      extra: {
        hashes: { md5: 'm', sha256: 's' },
        downloads: 5,
      },
      links: {
        info: 'i',
        move: 'm',
        upload: 'u',
        delete: 'd',
        download: 'dl',
        render: 'r',
        html: 'h',
        self: 's',
      },
      filesLink: null,
      previousFolder: false,
      provider: 'osfstorage',
      ...overrides,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FilesTreeRowComponent, MockComponent(FileMenuComponent)],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(FilesTreeRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('file', createTestFile());
    fixture.componentRef.setInput('allowedMenuActions', ALL_MENU_ACTIONS);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isFolder when kind is folder', () => {
    fixture.componentRef.setInput('file', createTestFile({ kind: FileKind.Folder }));
    fixture.detectChanges();

    expect(component.isFolder()).toBe(true);
  });

  it('should set isFolder false when kind is file', () => {
    fixture.componentRef.setInput('file', createTestFile({ kind: FileKind.File }));
    fixture.detectChanges();

    expect(component.isFolder()).toBe(false);
  });

  it('should clear downloadsCount for folder', () => {
    fixture.componentRef.setInput(
      'file',
      createTestFile({
        kind: FileKind.Folder,
        extra: { hashes: { md5: 'm', sha256: 's' }, downloads: 99 },
      })
    );
    fixture.detectChanges();

    expect(component.downloadsCount()).toBe('');
  });

  it('should expose downloadsCount for file with downloads', () => {
    fixture.componentRef.setInput(
      'file',
      createTestFile({
        kind: FileKind.File,
        extra: { hashes: { md5: 'm', sha256: 's' }, downloads: 12 },
      })
    );
    fixture.detectChanges();

    expect(component.downloadsCount()).toBe(12);
  });

  it('should clear downloadsCount when downloads is zero', () => {
    fixture.componentRef.setInput(
      'file',
      createTestFile({
        kind: FileKind.File,
        extra: { hashes: { md5: 'm', sha256: 's' }, downloads: 0 },
      })
    );
    fixture.detectChanges();

    expect(component.downloadsCount()).toBe('');
  });
});
