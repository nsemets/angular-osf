import { DestroyRef, Type } from '@angular/core';

import { ResourceType } from '@osf/shared/enums/resource-type.enum';

export interface DeleteResourceBaseOptions {
  rootParentId: string;
  resourceId: string;
  resourceType?: ResourceType;
  destroyRef: DestroyRef;
  onSuccess: () => void;
}

export interface DeleteResourceRunConfig extends DeleteResourceBaseOptions {
  dialogComponent: Type<unknown>;
  dialogHeader: string;
  dialogWidth: string;
  toastKey: string;
}
