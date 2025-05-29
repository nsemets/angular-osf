import { NodeData } from '@osf/features/my-projects/entities/node-response.model';
import { PaginatedViewOnlyLinksModel, ProjectSettingsModel } from '@osf/features/project/settings';
import { AsyncStateModel } from '@shared/models/store';

export interface SettingsStateModel {
  settings: AsyncStateModel<ProjectSettingsModel>;
  projectDetails: AsyncStateModel<NodeData>;
  viewOnlyLinks: AsyncStateModel<PaginatedViewOnlyLinksModel>;
}
