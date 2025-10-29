import { FormControl, FormGroup } from '@angular/forms';

import { StringOrNull } from '@osf/shared/helpers/types.helper';

export enum DeveloperAppFormFormControls {
  AppName = 'name',
  AppDescription = 'description',
  ProjectHomePageUrl = 'projHomePageUrl',
  AuthorizationCallbackUrl = 'authorizationCallbackUrl',
}

export type DeveloperAppForm = FormGroup<{
  [DeveloperAppFormFormControls.AppName]: FormControl<string>;
  [DeveloperAppFormFormControls.ProjectHomePageUrl]: FormControl<string>;
  [DeveloperAppFormFormControls.AppDescription]: FormControl<StringOrNull>;
  [DeveloperAppFormFormControls.AuthorizationCallbackUrl]: FormControl<string>;
}>;
