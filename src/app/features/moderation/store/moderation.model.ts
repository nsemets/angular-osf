import { AsyncStateModel } from '@osf/shared/models';

import { Moderator } from '../models';

interface ModerationDataStateModel extends AsyncStateModel<Moderator[]> {
  searchValue: string | null;
}

export interface ModerationStateModel {
  collectionModerators: ModerationDataStateModel;
}
