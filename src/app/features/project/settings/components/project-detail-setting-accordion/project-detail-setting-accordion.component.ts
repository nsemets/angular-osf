import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { LowerCasePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RightControl } from '@osf/features/project/settings/models/right-control.model';

@Component({
  selector: 'osf-project-detail-setting-accordion',
  imports: [NgClass, SelectModule, FormsModule, Button, LowerCasePipe, TranslatePipe],
  templateUrl: './project-detail-setting-accordion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProjectDetailSettingAccordionComponent {
  emitValueChange = output<{ index: number; value: boolean | string }>();
  title = input.required<string>();
  rightControls = input.required<RightControl[]>();
  expanded = signal(false);

  toggle() {
    this.expanded.set(!this.expanded());
  }
}
