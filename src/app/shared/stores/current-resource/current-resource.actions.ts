import { ResourceType } from '@osf/shared/enums/resource-type.enum';

export class GetResource {
  static readonly type = '[ResourceType] Get Resource';

  constructor(
    public resourceId: string,
    public refresh = false
  ) {}
}

export class GetResourceDetails {
  static readonly type = '[Current Resource] Get Resource Details';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType
  ) {}
}

export class GetResourceWithChildren {
  static readonly type = '[Current Resource] Get Resource With Children';

  constructor(
    public rootParentId: string,
    public resourceId: string,
    public resourceType: ResourceType
  ) {}
}
