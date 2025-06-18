import { StringOrNull } from '@core/helpers';
import { Preprint } from '@osf/features/preprints/models';

export class SetSelectedPreprintProviderId {
  static readonly type = '[Submit Preprint] Set Selected Preprint Provider Id';

  constructor(public id: StringOrNull) {}
}

export class CreatePreprint {
  static readonly type = '[Submit Preprint] Create Preprint';

  constructor(
    public title: string,
    public abstract: string,
    public providerId: string
  ) {}
}

export class UpdatePreprint {
  static readonly type = '[Submit Preprint] Update Preprint';

  constructor(
    public id: string,
    public payload: Partial<Preprint>
  ) {}
}

export class ResetStateAndDeletePreprint {
  static readonly type = '[Submit Preprint] Reset State And Delete Preprint';
}
