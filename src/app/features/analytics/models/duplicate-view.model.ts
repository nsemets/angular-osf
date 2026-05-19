import { NodeModel } from '@osf/shared/models/nodes/base-node.model';

export interface DuplicateViewModel extends NodeModel {
  canShowForkMenu: boolean;
}
