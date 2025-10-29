import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PERMISSION_OPTIONS } from '@osf/shared/constants/contributors.constants';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { RequestAccessModel } from '@shared/models/request-access/request-access.model';
import { SelectOption } from '@shared/models/select-option.model';

import { EducationHistoryDialogComponent } from '../../education-history-dialog/education-history-dialog.component';
import { EmploymentHistoryDialogComponent } from '../../employment-history-dialog/employment-history-dialog.component';
import { SelectComponent } from '../../select/select.component';

@Component({
  selector: 'osf-request-access-table',
  imports: [TranslatePipe, TableModule, Tooltip, Skeleton, Button, SelectComponent, Checkbox, FormsModule],
  templateUrl: './request-access-table.component.html',
  styleUrl: './request-access-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestAccessTableComponent {
  requestAccessList = input.required<RequestAccessModel[]>();
  isLoading = input(false);
  resourceType = input(ResourceType.Project);
  showEmployment = input(true);
  showEducation = input(true);
  showInfo = input(true);

  accept = output<RequestAccessModel>();
  reject = output<RequestAccessModel>();

  customDialogService = inject(CustomDialogService);

  readonly permissionsOptions: SelectOption[] = PERMISSION_OPTIONS;

  skeletonData = Array.from({ length: 3 }, () => ({}) as RequestAccessModel);

  isProject = computed(() => this.resourceType() === ResourceType.Project);

  acceptContributor(requestAccessItem: RequestAccessModel) {
    this.accept.emit(requestAccessItem);
  }

  rejectContributor(requestAccessItem: RequestAccessModel) {
    this.reject.emit(requestAccessItem);
  }

  openEducationHistory(requestAccessItem: RequestAccessModel) {
    this.customDialogService.open(EducationHistoryDialogComponent, {
      header: 'project.contributors.table.headers.education',
      width: '552px',
      data: requestAccessItem.creator?.education,
    });
  }

  openEmploymentHistory(requestAccessItem: RequestAccessModel) {
    this.customDialogService.open(EmploymentHistoryDialogComponent, {
      header: 'project.contributors.table.headers.employment',
      width: '552px',
      data: requestAccessItem.creator?.employment,
    });
  }
}
