export class GetProviders {
  static readonly type = '[Registries]  Get Providers';
}

export class GetProjects {
  static readonly type = '[Registries] Get Projects';
}

export class CreateDraft {
  static readonly type = '[Registries]  Create Draft';
  constructor(public payload: { registrationSchemaId: string; projectId?: string }) {}
}
