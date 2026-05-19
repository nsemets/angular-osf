import { RelatedNodeMenuAction } from '../enums/related-node-menu-action.enum';
import { RelatedNodeMenuItem } from '../models/related-node-menu-item.model';

export const RELATED_NODE_MENU_ITEMS: RelatedNodeMenuItem[] = [
  {
    label: 'project.overview.actions.manageContributors',
    action: RelatedNodeMenuAction.ManageContributors,
  },
  {
    label: 'project.overview.actions.settings',
    action: RelatedNodeMenuAction.Settings,
  },
  {
    label: 'common.labels.delete',
    action: RelatedNodeMenuAction.Delete,
  },
];
