import { Tag } from 'primeng/tag';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RegistryStatus } from '@osf/shared/enums';

import { RegistryStatusMap } from './default-statuses';

@Component({
  selector: 'osf-status-badge',
  imports: [Tag],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<RegistryStatus>();
  get label(): string {
    return RegistryStatusMap[this.status()]?.label ?? 'Unknown';
  }

  get severity(): 'info' | 'success' | 'warn' | 'danger' | null {
    return RegistryStatusMap[this.status()]?.severity ?? null;
  }
}
