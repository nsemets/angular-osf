import { PreprintDraftDeletionService } from '@osf/features/preprints/services/preprint-draft-deletion.service';

export type PreprintDraftDeletionServiceMockType = Partial<PreprintDraftDeletionService> & {
  deleted: boolean;
  confirmDeleteDraft: jest.Mock;
  canDeactivate: jest.Mock;
  deleteOnDestroyIfNeeded: jest.Mock;
};

export const PreprintDraftDeletionServiceMock = {
  simple(): PreprintDraftDeletionServiceMockType {
    const service: PreprintDraftDeletionServiceMockType = {
      deleted: false,
      confirmDeleteDraft: jest.fn(),
      canDeactivate: jest.fn((submitted: boolean) => submitted || service.deleted),
      deleteOnDestroyIfNeeded: jest.fn((onDelete: () => void) => {
        if (!service.deleted) {
          onDelete();
        }
      }),
    };
    return service;
  },
};
