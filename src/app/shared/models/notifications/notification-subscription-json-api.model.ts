import { SubscriptionFrequency } from '@osf/shared/enums/subscriptions/subscription-frequency.enum';

export interface NotificationSubscriptionGetResponseJsonApi {
  id: string;
  type: 'subscription' | 'user-provider-subscription';
  attributes: {
    event_name: string;
    frequency: string;
  };
}

export interface NotificationSubscriptionUpdateRequestJsonApi {
  data: {
    id?: string;
    type: 'subscription' | 'user-provider-subscription';
    attributes: {
      frequency: SubscriptionFrequency;
    };
  };
}
