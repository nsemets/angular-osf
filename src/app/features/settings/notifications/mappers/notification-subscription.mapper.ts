import { SubscriptionEvent, SubscriptionFrequency } from '../enums';
import {
  NotificationSubscription,
  NotificationSubscriptionGetResponse,
  NotificationSubscriptionUpdateRequest,
} from '../models';

export class NotificationSubscriptionMapper {
  static fromGetResponse(response: NotificationSubscriptionGetResponse): NotificationSubscription {
    return {
      id: response.id,
      event: response.attributes.event_name as SubscriptionEvent,
      frequency: response.attributes.frequency as SubscriptionFrequency,
    };
  }

  static toUpdateRequest(
    id: string,
    frequency: SubscriptionFrequency,
    isNodeSubscription?: boolean
  ): NotificationSubscriptionUpdateRequest {
    const baseAttributes = {
      frequency: frequency,
    };

    return {
      data: {
        type: isNodeSubscription ? 'user-provider-subscription' : 'subscription',
        attributes: baseAttributes,
        ...(isNodeSubscription ? {} : { id }),
      },
    };
  }
}
