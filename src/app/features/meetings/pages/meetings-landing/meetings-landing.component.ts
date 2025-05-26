import { TranslatePipe } from '@ngx-translate/core';

import { SortEvent } from 'primeng/api';
import { Card } from 'primeng/card';
import { TableModule, TablePageEvent } from 'primeng/table';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { SearchInputComponent, SubHeaderComponent } from '@osf/shared/components';
import { TableParameters } from '@osf/shared/models';
import { IS_XSMALL } from '@osf/shared/utils';

import { MEETINGS_TABLE_PARAMS } from '../../constants';
import { Meeting } from '../../models';
import { testMeetings } from '../../test-data';

@Component({
  selector: 'osf-meetings-landing',
  imports: [SubHeaderComponent, Card, SearchInputComponent, DatePipe, TableModule, TranslatePipe],
  templateUrl: './meetings-landing.component.html',
  styleUrl: './meetings-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingsLandingComponent {
  @HostBinding('class') classes = 'flex-1 flex flex-column w-full h-full';
  readonly isXSmall = toSignal(inject(IS_XSMALL));
  #router = inject(Router);

  searchValue = signal('');
  sortColumn = signal<string | undefined>(undefined);
  tableParams = signal<TableParameters>({
    ...MEETINGS_TABLE_PARAMS,
    firstRowIndex: 0,
  });
  meetings = signal<Meeting[]>(testMeetings);

  onPageChange(tablePageEvent: TablePageEvent) {
    // [RNi] TODO: implement paging logic and handle event while integrating API
  }

  onSort(sortEvent: SortEvent) {
    // [RNi] TODO: implement sorting logic and handle event while integrating API
  }

  navigateToMeeting(meeting: Meeting): void {
    this.#router.navigate(['/meetings', meeting.id]);
  }
}
