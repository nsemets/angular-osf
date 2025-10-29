import { StorageItem } from './storage-item.model';

export interface OperationInvocation {
  id: string;
  type: string;
  invocationStatus: string;
  operationName: string;
  operationKwargs: {
    itemId?: string;
    itemType?: string;
  };
  operationResult: StorageItem[];
  itemCount: number;
  thisSampleCursor?: string;
  firstSampleCursor?: string;
  nextSampleCursor?: string;
}
