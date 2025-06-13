import { TranslatePipe } from '@ngx-translate/core';

import { SafeHtmlPipe } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WikiVersion } from '../../models';

@Component({
  selector: 'osf-view-section',
  imports: [PanelModule, Select, FormsModule, TranslatePipe, SafeHtmlPipe],
  templateUrl: './view-section.component.html',
  styleUrl: './view-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSectionComponent {
  previewContent = input.required<string>();
  versions = input.required<WikiVersion[]>();
  versionContent = input.required<string>();
  selectVersion = output<string>();

  previewOption = {
    label: 'Preview',
    value: null,
  };

  selectedVersion = signal<string | null>(null);

  content = computed(() => {
    return this.selectedVersion() === null ? this.previewContent() : this.versionContent();
  });

  mappedVersions = computed(() => [
    this.previewOption,
    ...this.versions().map((version, index) => {
      const labelPrefix = index === 0 ? '(Current)' : `(${index})`;
      return {
        label: `${labelPrefix} ${version.createdBy}: (${new Date(version.createdAt).toLocaleString()})`,
        value: version.id,
      };
    }),
  ]);

  onVersionChange(versionId: string): void {
    this.selectedVersion.set(versionId);
    if (versionId) {
      this.selectVersion.emit(versionId);
    }
  }
}
