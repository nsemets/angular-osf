import { OptionModel } from '@osf/features/project/settings';
import { SubscriptionEvent } from '@osf/features/settings/notifications/enums';

export interface RightControl {
  type: 'dropdown';
  label?: string;
  value: boolean | string;
  options: OptionModel[];
  event?: SubscriptionEvent;
}
