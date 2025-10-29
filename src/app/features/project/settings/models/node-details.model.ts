import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { IdName } from '@shared/models/common/id-name.model';
import { Institution } from '@shared/models/institutions/institutions.models';

export interface NodeDetailsModel {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  region: IdName | null;
  affiliatedInstitutions: Institution[];
  currentUserPermissions: UserPermissions[];
  rootId?: string;
  parentId?: string;
  lastFetched: number;
}
