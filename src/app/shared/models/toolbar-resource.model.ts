import { ResourceType } from '@shared/enums/resource-type.enum';

import { NodeStorageModel } from './nodes/node-storage.model';

export interface ToolbarResource {
  id: string;
  title: string;
  isPublic: boolean;
  storage?: NodeStorageModel;
  viewOnlyLinksCount: number;
  forksCount: number;
  resourceType: ResourceType;
  isAnonymous: boolean;
}
