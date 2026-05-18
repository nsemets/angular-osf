import { Mock } from 'vitest';

import { DeleteComponentOptions, DeleteProjectOptions } from '@osf/shared/models/delete-resource-options.model';
import { DeleteResourceService } from '@osf/shared/services/delete-resource.service';

type DeleteComponentFn = (options: DeleteComponentOptions) => void;
type DeleteProjectFn = (options: DeleteProjectOptions) => void;

export type DeleteResourceServiceMockType = Partial<DeleteResourceService> & {
  deleteComponent: Mock<DeleteComponentFn>;
  deleteProject: Mock<DeleteProjectFn>;
};

export const DeleteResourceServiceMock = {
  simple(): DeleteResourceServiceMockType {
    return {
      deleteComponent: vi.fn(),
      deleteProject: vi.fn(),
    };
  },
};
