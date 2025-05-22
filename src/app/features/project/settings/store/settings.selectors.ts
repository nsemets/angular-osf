import { Selector } from '@ngxs/store';

import { SettingsStateModel } from '@osf/features/project/settings/store/settings.model';
import { SettingsState } from '@osf/features/project/settings/store/settings.state';

export class SettingsSelectors {
  @Selector([SettingsState])
  static getSettings(state: SettingsStateModel) {
    return state.settings.data;
  }
}
