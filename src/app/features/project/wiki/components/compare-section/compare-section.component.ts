import { TranslatePipe } from '@ngx-translate/core';

import { PanelModule } from 'primeng/panel';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';

import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WikiVersion } from '../../models';

@Component({
  selector: 'osf-compare-section',
  imports: [PanelModule, Select, FormsModule, TranslatePipe, Skeleton],
  templateUrl: './compare-section.component.html',
  styleUrl: './compare-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareSectionComponent {
  versions = input.required<WikiVersion[]>();
  versionContent = input.required<string>();
  isLoading = input.required<boolean>();
  selectVersion = output<string>();

  selectedVersion: string | null = null;

  mappedVersions = computed(() => [
    ...this.versions().map((version, index) => {
      const labelPrefix = index === 0 ? '(Current)' : `(${index})`;
      return {
        label: `${labelPrefix} ${version.createdBy}: (${new Date(version.createdAt).toLocaleString()})`,
        value: version.id,
      };
    }),
  ]);

  constructor() {
    effect(() => {
      this.versions();
      this.selectedVersion = null;
    });
  }

  onVersionChange(versionId: string): void {
    this.selectedVersion = versionId;
    this.selectVersion.emit(versionId);
  }
}
