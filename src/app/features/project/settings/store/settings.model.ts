import { ProjectSettingsModel } from '@osf/features/project/settings';
import { AsyncStateModel } from '@shared/models/store';

export interface SettingsStateModel {
  settings: AsyncStateModel<ProjectSettingsModel>;
}
