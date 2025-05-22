import { OptionModel } from '@osf/features/project/settings';

export interface RightControl {
  type: 'dropdown';
  label?: string;
  value: boolean | string;
  options: OptionModel[];
}
