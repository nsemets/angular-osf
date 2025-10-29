import { SubscriptionEvent, SubscriptionFrequency } from '@osf/shared/enums/subscriptions';

export interface NotificationSubscription {
  id: string;
  event: SubscriptionEvent;
  frequency: SubscriptionFrequency;
}
