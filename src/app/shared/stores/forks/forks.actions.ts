export class GetAllForks {
  static readonly type = '[Forks] Get All Forks';

  constructor(
    public resourceId: string,
    public resourceType: string,
    public page: number,
    public pageSize: number
  ) {}
}

export class ClearForks {
  static readonly type = '[Forks] Clear Forks';
}
