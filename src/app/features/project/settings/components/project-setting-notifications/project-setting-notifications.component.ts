import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

import { SubscriptionEvent } from '@osf/shared/enums/subscriptions/subscription-event.enum';
import { SubscriptionFrequency } from '@osf/shared/enums/subscriptions/subscription-frequency.enum';
import { NotificationSubscription } from '@osf/shared/models/notifications/notification-subscription.model';

import { RightControl } from '../../models';
import { NotificationDescriptionPipe } from '../../pipes';
import { ProjectDetailSettingAccordionComponent } from '../project-detail-setting-accordion/project-detail-setting-accordion.component';

@Component({
  selector: 'osf-project-setting-notifications',
  imports: [Card, TranslatePipe, ProjectDetailSettingAccordionComponent, NotificationDescriptionPipe],
  templateUrl: './project-setting-notifications.component.html',
  styleUrl: './project-setting-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingNotificationsComponent {
  notifications = input.required<NotificationSubscription[]>();
  title = input<string>();
  notificationEmitValue = output<NotificationSubscription>();

  allAccordionData: RightControl[] | undefined = [];

  readonly subscriptionEvent = SubscriptionEvent;

  subscriptionFrequencyOptions = Object.entries(SubscriptionFrequency).map(([key, value]) => ({
    label: key,
    value,
  }));

  constructor() {
    effect(() => {
      this.allAccordionData = this.notifications().map((notification) => {
        return {
          label: 'settings.notifications.notificationPreferences.items.files',
          value: notification.frequency as string,
          type: 'dropdown',
          options: this.subscriptionFrequencyOptions,
          event: notification.event,
        } as RightControl;
      });
    });
  }

  changeEmittedValue(emittedValue: { index: number; value: boolean | string }): void {
    if (this.allAccordionData) {
      this.notificationEmitValue.emit({
        id: this.notifications()[0].id,
        event: this.allAccordionData[emittedValue.index].event as SubscriptionEvent,
        frequency: emittedValue.value as SubscriptionFrequency,
      });
    }
  }
}
