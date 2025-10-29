import { TranslatePipe } from '@ngx-translate/core';

import { Tag } from 'primeng/tag';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RegistryStatusMap } from '@osf/shared/constants/registration-statuses';
import { RegistryStatus } from '@osf/shared/enums/registry-status.enum';
import { SeverityType } from '@shared/models/severity.type';

@Component({
  selector: 'osf-status-badge',
  imports: [Tag, TranslatePipe],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<RegistryStatus>();

  get label(): string {
    return RegistryStatusMap[this.status()]?.label ?? 'Unknown';
  }

  get severity(): SeverityType | null {
    return RegistryStatusMap[this.status()]?.severity ?? null;
  }
}
