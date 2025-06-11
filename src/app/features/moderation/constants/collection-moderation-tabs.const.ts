import { TabOption } from '@osf/shared/models';

import { CollectionModerationTab } from '../enums';

export const COLLECTION_MODERATION_TABS: TabOption[] = [
  { label: 'moderation.allItems', value: CollectionModerationTab.AllItems },
  { label: 'moderation.moderators', value: CollectionModerationTab.Moderators },
  { label: 'moderation.settings', value: CollectionModerationTab.Settings },
];
