import { Moderator } from '../models';

const ACTION_SCOPE = '[Moderation]';

export class LoadCollectionModerators {
  static readonly type = `${ACTION_SCOPE} Load Collection Moderators`;

  constructor(public providerId: string) {}
}

export class AddCollectionModerator {
  static readonly type = `${ACTION_SCOPE} Add Collection Moderator`;

  constructor(
    public projectId: string,
    public moderator: Moderator
  ) {}
}

export class UpdateCollectionModerator {
  static readonly type = `${ACTION_SCOPE} Update Collection Moderator`;

  constructor(
    public projectId: string,
    public moderator: Moderator
  ) {}
}

export class DeleteCollectionModerator {
  static readonly type = `${ACTION_SCOPE} Delete Collection Moderator`;

  constructor(
    public projectId: string,
    public moderatorId: string
  ) {}
}

export class UpdateCollectionSearchValue {
  static readonly type = `${ACTION_SCOPE} Update Collection Search Value`;

  constructor(public searchValue: string | null) {}
}
