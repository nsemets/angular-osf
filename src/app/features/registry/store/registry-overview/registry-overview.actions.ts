import { ReviewActionPayload } from '@osf/shared/models/review-action/review-action-payload.model';

export class GetRegistryById {
  static readonly type = '[Registry Overview] Get Registry By Id';

  constructor(public id: string) {}
}

export class GetRegistryInstitutions {
  static readonly type = '[Registry Overview] Get Registry Institutions';

  constructor(public registryId: string) {}
}

export class GetRegistryIdentifiers {
  static readonly type = '[Registry Overview] Get Registry Identifiers';

  constructor(public registryId: string) {}
}

export class GetRegistryLicense {
  static readonly type = '[Registry Overview] Get Registry License';

  constructor(public licenseId: string) {}
}

export class GetSchemaBlocks {
  static readonly type = '[Registry Overview] Get Schema Blocks';

  constructor(public schemaLink: string) {}
}

export class GetRegistrySchemaResponses {
  static readonly type = '[Registry Overview] Get Registry Schema Responses';

  constructor(public registryId: string) {}
}

export class CreateSchemaResponse {
  static readonly type = '[Registry Overview] Create Schema Response';

  constructor(public registryId: string) {}
}

export class GetRegistryReviewActions {
  static readonly type = '[Registry Overview] Get Registry Review Actions';

  constructor(public registryId: string) {}
}

export class SetRegistryCustomCitation {
  static readonly type = '[Registry Overview] Set Registry Custom Citation';

  constructor(public citation: string) {}
}

export class WithdrawRegistration {
  static readonly type = '[Registry Overview] Withdraw Registration';

  constructor(
    public registryId: string,
    public justification: string
  ) {}
}

export class MakePublic {
  static readonly type = '[Registry Overview] Make Public';

  constructor(public registryId: string) {}
}

export class SubmitDecision {
  static readonly type = '[Registry Overview] Submit Decision';

  constructor(
    public payload: ReviewActionPayload,
    public isRevision: boolean
  ) {}
}

export class ClearRegistryOverview {
  static readonly type = '[Registry Overview] Clear Registry Overview';
}
