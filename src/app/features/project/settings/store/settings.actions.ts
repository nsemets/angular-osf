import { UpdateNodeRequestModel } from '@osf/features/my-projects/entities/update-node-request.model';
import { ProjectSettingsData } from '@osf/features/project/settings';

export class GetProjectSettings {
  static readonly type = '[Settings] Get';

  constructor(public projectId: string) {}
}

export class GetProjectDetails {
  static readonly type = '[Project] Get';

  constructor(public projectId: string) {}
}

export class UpdateProjectSettings {
  static readonly type = '[Settings] Update';

  constructor(public payload: ProjectSettingsData) {}
}

export class UpdateProjectDetails {
  static readonly type = '[Project] Update';

  constructor(public payload: UpdateNodeRequestModel) {}
}
