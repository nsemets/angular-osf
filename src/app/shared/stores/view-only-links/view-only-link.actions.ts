import { ViewOnlyLinkJsonApi } from '@osf/shared/models';

export class FetchViewOnlyLinks {
  static readonly type = '[Link] Fetch View Only Links';

  constructor(public projectId: string) {}
}

export class CreateViewOnlyLink {
  static readonly type = '[Link] Create View Only Links';

  constructor(
    public projectId: string,
    public payload: ViewOnlyLinkJsonApi
  ) {}
}

export class DeleteViewOnlyLink {
  static readonly type = '[Link] Delete View Only Links';

  constructor(
    public projectId: string,
    public linkId: string
  ) {}
}
