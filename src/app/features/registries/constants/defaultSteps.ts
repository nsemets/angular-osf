import { StepOption } from '@osf/shared/models';

export const defaultSteps: StepOption[] = [
  {
    label: 'Metadata',
    value: '',
    routeLink: 'metadata',
    invalid: true, // Initially set to true, will be updated based on validation
  },
  {
    label: 'Review',
    value: '',
    routeLink: 'review',
  },
];
