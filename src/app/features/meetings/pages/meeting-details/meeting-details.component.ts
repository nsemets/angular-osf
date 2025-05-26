import { TranslatePipe } from '@ngx-translate/core';

import { SortEvent } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule, TablePageEvent } from 'primeng/table';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostBinding, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SearchInputComponent, SubHeaderComponent } from '@osf/shared/components';
import { TableParameters } from '@osf/shared/models';

import { MEETING_SUBMISSIONS_TABLE_PARAMS } from '../../constants';
import { Meeting, MeetingSubmission } from '../../models';
import { testMeeting, testSubmissions } from '../../test-data';

@Component({
  selector: 'osf-meeting-details',
  imports: [SubHeaderComponent, SearchInputComponent, DatePipe, TableModule, Button, RouterLink, TranslatePipe],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingDetailsComponent {
  @HostBinding('class') classes = 'flex-1 flex flex-column w-full h-full';
  #datePipe = inject(DatePipe);
  searchValue = signal('');
  sortColumn = signal<string | undefined>(undefined);
  tableParams = signal<TableParameters>({
    ...MEETING_SUBMISSIONS_TABLE_PARAMS,
    firstRowIndex: 0,
  });
  meeting = signal<Meeting>(testMeeting);
  meetingSubmissions = signal<MeetingSubmission[]>(testSubmissions);

  pageDescription = computed(() => {
    if (!this.meeting) {
      return '';
    }

    return `${this.meeting().location} | ${this.#datePipe.transform(this.meeting().startDate, 'MMM d, y')}
    - ${this.#datePipe.transform(this.meeting().endDate, 'MMM d, y')}`;
  });

  onPageChange(tablePageEvent: TablePageEvent) {
    // [RNi] TODO: implement paging logic and handle event while integrating API
  }

  onSort(sortEvent: SortEvent) {
    // [RNi] TODO: implement sorting logic and handle event while integrating API
  }

  downloadSubmission(event: Event, item: MeetingSubmission) {
    event.stopPropagation();
    window.open(item.downloadLink, '_blank');
  }
}
