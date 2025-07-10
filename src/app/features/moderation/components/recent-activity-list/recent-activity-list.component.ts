import { TranslatePipe } from '@ngx-translate/core';

import { PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { recentActivity } from '@osf/features/moderation/components/test-data';
import { ReviewStatusIcon } from '@osf/features/moderation/constants';
import { CustomPaginatorComponent, IconComponent } from '@osf/shared/components';

@Component({
  selector: 'osf-recent-activity-list',
  imports: [TableModule, DatePipe, TranslatePipe, IconComponent, CustomPaginatorComponent],
  templateUrl: './recent-activity-list.component.html',
  styleUrl: './recent-activity-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivityListComponent {
  recentActivity = recentActivity;

  protected first = signal(0);
  protected totalUsersCount = signal(20);

  readonly reviewStatusIcon = ReviewStatusIcon;

  pageChanged(event: PaginatorState) {
    console.log(event);
  }
}
