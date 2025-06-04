import { TranslatePipe } from '@ngx-translate/core';

import { PanelModule } from 'primeng/panel';
import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'osf-compare-section',
  imports: [PanelModule, Select, FormsModule, TranslatePipe],
  templateUrl: './compare-section.component.html',
  styleUrl: './compare-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareSectionComponent {
  selectedVersion: string | null = null;

  versions: string[] = ['Version 1', 'Version 2', 'Version 3', 'Version 4', 'Version 5'];

  onVersionChange(event: { value: string }): void {
    console.log('Selected version:', event.value);
  }
}
