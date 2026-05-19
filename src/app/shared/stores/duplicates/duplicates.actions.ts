import { ResourceType } from '@osf/shared/enums/resource-type.enum';

export class GetAllDuplicates {
  static readonly type = '[Forks] Get All Duplicates';

  constructor(
    public resourceId: string,
    public resourceType: ResourceType,
    public page: number,
    public pageSize: number
  ) {}
}

export class ClearDuplicates {
  static readonly type = '[Forks] Clear Duplicates';
}
