import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { ViewOnlyLinkJsonApi } from '@osf/shared/models';

export class FetchViewOnlyLinks {
  static readonly type = '[Link] Fetch View Only Links';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType | undefined
  ) {}
}

export class CreateViewOnlyLink {
  static readonly type = '[Link] Create View Only Links';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType | undefined,
    public payload: ViewOnlyLinkJsonApi
  ) {}
}

export class DeleteViewOnlyLink {
  static readonly type = '[Link] Delete View Only Links';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType | undefined,
    public linkId: string
  ) {}
}
