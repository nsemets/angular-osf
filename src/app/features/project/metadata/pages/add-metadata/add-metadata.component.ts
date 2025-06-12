import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, HostBinding, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CedarMetadataDataTemplate } from '@osf/features/project/metadata/models';
import { CedarTemplateFormComponent } from '@osf/features/project/metadata/pages/add-metadata/components';
import { SubHeaderComponent } from '@shared/components';
import { ToastService } from '@shared/services';

import { GetCedarMetadataTemplates, ProjectMetadataSelectors } from '../../store';

@Component({
  selector: 'osf-add-metadata',
  standalone: true,
  imports: [SubHeaderComponent, Button, TranslatePipe, CedarTemplateFormComponent],
  templateUrl: './add-metadata.component.html',
  styleUrl: './add-metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMetadataComponent implements OnInit {
  @HostBinding('class') classes = 'flex flex-1 flex-column w-full h-full';

  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly store = inject(Store);

  selectedTemplate!: CedarMetadataDataTemplate;

  protected readonly cedarTemplates = select(ProjectMetadataSelectors.getCedarTemplates);
  protected readonly cedarTemplatesLoading = select(ProjectMetadataSelectors.getCedarTemplatesLoading);

  protected actions = createDispatchMap({
    getCedarTemplates: GetCedarMetadataTemplates,
  });

  ngOnInit(): void {
    this.actions.getCedarTemplates();
  }

  onSelect(template: CedarMetadataDataTemplate): void {
    this.selectedTemplate = template;
  }

  onCancel(): void {
    const templates = this.cedarTemplates();
    if (templates?.links?.first && templates?.links?.last && templates.links.first !== templates.links.last) {
      this.actions.getCedarTemplates();
    } else {
      this.router.navigate(['../']);
    }
  }

  onNext(): void {
    const templates = this.cedarTemplates();
    if (!templates?.links?.next) {
      return;
    }

    this.actions.getCedarTemplates(templates.links.next);
  }

  hasNextPage(): boolean {
    const templates = this.cedarTemplates();
    return !!templates?.links?.next;
  }

  hasMultiplePages(): boolean {
    const templates = this.cedarTemplates();
    return !!(templates?.links?.first && templates?.links?.last && templates.links.first !== templates.links.last);
  }
}
