import { AddResource } from '@osf/features/registry/models/resources/add-resource.model';
import { AddResourceRequest } from '@osf/features/registry/models/resources/add-resource-request.model';
import { ConfirmAddResource } from '@osf/features/registry/models/resources/confirm-add-resource.model';

export class GetRegistryResources {
  static readonly type = '[Registry Resources] Get Registry Resources';

  constructor(public registryId: string) {}
}

export class AddRegistryResource {
  static readonly type = '[Registry Resources] Add Registry Resources';

  constructor(public registryId: string) {}
}

export class PreviewRegistryResource {
  static readonly type = '[Registry Resources] Preview Registry Resources';

  constructor(public resource: AddResourceRequest<AddResource>) {}
}

export class ConfirmAddRegistryResource {
  static readonly type = '[Registry Resources] Confirm Add Registry Resources';

  constructor(
    public resource: AddResourceRequest<ConfirmAddResource>,
    public registryId: string
  ) {}
}

export class DeleteResource {
  static readonly type = '[Registry Resources] Delete Registry Resources';

  constructor(
    public resourceId: string,
    public registryId: string
  ) {}
}

export class UpdateResource {
  static readonly type = '[Registry Resources] Update Registry Resources';

  constructor(
    public registryId: string,
    public resource: AddResourceRequest<AddResource>
  ) {}
}
