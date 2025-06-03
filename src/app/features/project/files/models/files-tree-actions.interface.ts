import { Observable } from 'rxjs';

import { OsfFile } from '@osf/features/project/files/models';

export interface FilesTreeActions {
  setCurrentFolder: (folder: OsfFile | null) => Observable<any>;
  setSearch: (search: string) => Observable<any>;
  setSort: (sort: string) => Observable<any>;
  setFilesIsLoading: (isLoading: boolean) => Observable<any>;
  getFiles: (filesLink: string) => Observable<any>;
  getRootFolderFiles: (projectId: string) => Observable<any>;
  deleteEntry: (projectId: string, link: string) => Observable<any>;
  renameEntry: (projectId: string, link: string, newName: string) => Observable<any>;
  setMoveFileCurrentFolder: (folder: OsfFile | null) => Observable<any>;
}
