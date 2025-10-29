import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { Institution } from '@shared/models/institutions/institutions.models';

export class FetchUserInstitutions {
  static readonly type = '[Institutions] Fetch User Institutions';
}

export class FetchInstitutions {
  static readonly type = '[Institutions] Fetch Institutions';

  constructor(public searchValue?: string) {}
}

export class FetchResourceInstitutions {
  static readonly type = '[Institutions] Fetch Resource Institutions';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType
  ) {}
}

export class UpdateResourceInstitutions {
  static readonly type = '[Institutions] Update Resource Institutions';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType,
    public institutions: Institution[]
  ) {}
}
