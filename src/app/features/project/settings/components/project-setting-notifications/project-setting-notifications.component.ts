import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

import { ProjectDetailSettingAccordionComponent } from '@osf/features/project/settings/components';
import { RightControl } from '@osf/features/project/settings/models/right-control.model';
import { SubscriptionEvent, SubscriptionFrequency } from '@osf/features/settings/notifications/enums';
import { NotificationSubscription } from '@osf/features/settings/notifications/models';

@Component({
  selector: 'osf-project-setting-notifications',
  imports: [Card, TranslatePipe, ProjectDetailSettingAccordionComponent],
  templateUrl: './project-setting-notifications.component.html',
  styleUrl: '../../settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingNotificationsComponent {
  notificationEmitValue = output<{ event: SubscriptionEvent; frequency: SubscriptionFrequency }>();
  title = input<string>();
  notifications = input<NotificationSubscription[]>();

  allAccordionData: RightControl[] | undefined = [];

  protected subscriptionFrequencyOptions = Object.entries(SubscriptionFrequency).map(([key, value]) => ({
    label: key,
    value,
  }));

  constructor() {
    effect(() => {
      this.allAccordionData = this.notifications()?.map((notification) => {
        if (notification.event === SubscriptionEvent.Comments) {
          return {
            label: 'settings.notifications.notificationPreferences.items.comments',
            value: notification.frequency as string,
            type: 'dropdown',
            options: this.subscriptionFrequencyOptions,
            event: notification.event,
          } as RightControl;
        } else {
          return {
            label: 'settings.notifications.notificationPreferences.items.files',
            value: notification.frequency as string,
            type: 'dropdown',
            options: this.subscriptionFrequencyOptions,
            event: notification.event,
          } as RightControl;
        }
      });
    });
  }

  changeEmittedValue(emittedValue: { index: number; value: boolean | string }): void {
    if (this.allAccordionData) {
      this.notificationEmitValue.emit({
        event: this.allAccordionData[emittedValue.index].event as SubscriptionEvent,
        frequency: emittedValue.value as SubscriptionFrequency,
      });
    }
  }
}
