import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MY_PROJECTS_TABLE_PARAMS } from '@osf/core/constants';
import { PERMISSION_OPTIONS } from '@osf/features/project/contributors/constants';
import { SelectComponent } from '@osf/shared/components';
import { SelectOption, TableParameters } from '@osf/shared/models';

import { Moderator } from '../../models';

@Component({
  selector: 'osf-collection-moderators-list',
  imports: [TranslatePipe, FormsModule, TableModule, Tooltip, Skeleton, Button, SelectComponent],
  templateUrl: './collection-moderators-list.component.html',
  styleUrl: './collection-moderators-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionModeratorsListComponent {
  items = input<Moderator[]>([]);
  isLoading = input(false);

  remove = output<Moderator>();
  showEducationHistory = output<Moderator>();
  showEmploymentHistory = output<Moderator>();

  protected readonly tableParams = signal<TableParameters>({ ...MY_PROJECTS_TABLE_PARAMS });
  protected readonly permissionsOptions: SelectOption[] = PERMISSION_OPTIONS;

  skeletonData: Moderator[] = Array.from({ length: 3 }, () => ({}) as Moderator);

  protected removeContributor(item: Moderator) {
    this.remove.emit(item);
  }

  protected openEducationHistory(item: Moderator) {
    this.showEducationHistory.emit(item);
  }

  protected openEmploymentHistory(item: Moderator) {
    this.showEmploymentHistory.emit(item);
  }
}
