import { StepOption } from '@osf/shared/models/step-option.model';

import { PreprintSteps } from '../enums';

export const createNewVersionStepsConst: StepOption[] = [
  {
    index: 0,
    label: 'preprints.preprintStepper.steps.file',
    value: PreprintSteps.File,
  },
  {
    index: 1,
    label: 'preprints.preprintStepper.steps.review',
    value: PreprintSteps.Review,
  },
];
