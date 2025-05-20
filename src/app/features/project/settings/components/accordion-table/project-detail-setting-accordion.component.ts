import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { LowerCasePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type RightControl =
  | {
      type: 'dropdown';
      label?: string;
      value: string;
      options: { label: string; value: string }[];
      onChange?: (value: string) => void;
    }
  | {
      type: 'text';
      label?: string;
      value: string;
    };

@Component({
  selector: 'osf-project-detail-setting-accordion',
  imports: [NgClass, DropdownModule, FormsModule, Button, LowerCasePipe],
  templateUrl: './project-detail-setting-accordion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailSettingAccordionComponent {
  title = input.required<string>();

  rightControls = input.required<RightControl[]>();

  expanded = signal(false);

  toggle() {
    this.expanded.set(!this.expanded());
  }
}
