import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, HostBinding, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SubHeaderComponent } from '@shared/components';
import { ToastService } from '@shared/services';

import { metadataTemplates } from '../../models';

@Component({
  selector: 'osf-add-metadata',
  standalone: true,
  imports: [SubHeaderComponent, Button],
  templateUrl: './add-metadata.component.html',
  styleUrl: './add-metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMetadataComponent {
  @HostBinding('class') classes = 'flex flex-1 flex-column w-full h-full';

  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly metadataTemplates = metadataTemplates;
  protected selectedTemplate: string | null = null;

  onSelect(templateTitle: string): void {
    this.selectedTemplate = templateTitle;
  }

  onCancel(): void {
    this.router.navigate(['../']).catch(() => this.toastService.showError('common.errors.navigationFailed'));
  }

  onNext(): void {
    if (!this.selectedTemplate) {
      this.toastService.showError('common.errors.templateRequired');
      return;
    }
    // TODO: Implement next step logic
    console.log('Selected template:', this.selectedTemplate);
  }
}
