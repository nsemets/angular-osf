import { of } from 'rxjs';

import { AddonsService } from '@osf/shared/services/addons/addons.service';
import { OperationInvocation } from '@shared/models/addons/operation-invocation.model';

import { Mocked } from 'vitest';

export function AddonsServiceMockFactory() {
  return {
    createAddonOperationInvocation: vi.fn().mockReturnValue(of({} as OperationInvocation)),
  } as unknown as Mocked<AddonsService>;
}
