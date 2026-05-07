import { Observable } from 'rxjs';

import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';

export interface DeleteSelectedOptions {
  files: FileModel[];
  deleteEntry: (link: string) => Observable<unknown>;
  onSuccess: () => void;
}

export interface MoveFilesOptions {
  files: FileModel[];
  action: 'move' | 'copy';
  resourceId: string;
  storageProvider: string;
  foldersStack: FileFolderModel[];
  initialFolder: FileFolderModel | null | undefined;
}

export interface CreateFolderOptions {
  newFolderLink: string;
  createFolder: (newFolderLink: string, folderName: string) => Observable<unknown>;
}
