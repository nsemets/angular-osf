import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';

import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { NodeModel } from '@osf/shared/models/nodes/base-node.model';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { DeleteResourceService } from '@osf/shared/services/delete-resource.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { GetComponents, LoadMoreComponents, ProjectOverviewSelectors, ReorderComponents } from '../../store';
import { AddComponentDialogComponent } from '../add-component-dialog/add-component-dialog.component';
import { ComponentCardComponent } from '../component-card/component-card.component';

@Component({
  selector: 'osf-project-components',
  imports: [Button, CdkDrag, CdkDropList, Skeleton, TranslatePipe, ComponentCardComponent],
  templateUrl: './overview-components.component.html',
  styleUrl: './overview-components.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponentsComponent {
  private readonly router = inject(Router);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly deleteResourceService = inject(DeleteResourceService);

  readonly canEdit = input.required<boolean>();
  readonly anonymous = input<boolean>(false);

  readonly components = select(ProjectOverviewSelectors.getComponents);
  readonly isComponentsLoading = select(ProjectOverviewSelectors.getComponentsLoading);
  readonly isComponentsSubmitting = select(ProjectOverviewSelectors.getComponentsSubmitting);
  readonly hasMoreComponents = select(ProjectOverviewSelectors.hasMoreComponents);
  readonly project = select(ProjectOverviewSelectors.getProject);

  private readonly actions = createDispatchMap({
    getComponents: GetComponents,
    loadMoreComponents: LoadMoreComponents,
    reorderComponents: ReorderComponents,
  });

  readonly reorderedComponents = signal<NodeModel[]>([]);

  readonly isDragDisabled = computed(
    () => this.isComponentsSubmitting() || (!this.canEdit() && this.reorderedComponents().length <= 1)
  );

  constructor() {
    effect(() => {
      const componentsData = this.components();
      this.reorderedComponents.set([...componentsData]);
    });
  }

  handleMenuAction(action: string, componentId: string): void {
    switch (action) {
      case 'manageContributors':
        this.router.navigate([componentId, 'contributors']);
        break;
      case 'settings':
        this.router.navigate([componentId, 'settings']);
        break;
      case 'delete':
        this.handleDeleteComponent(componentId);
        break;
    }
  }

  handleAddComponent(): void {
    this.customDialogService.open(AddComponentDialogComponent, {
      header: 'project.overview.dialog.addComponent.header',
      width: '850px',
    });
  }

  handleComponentNavigate(componentId: string): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/', componentId], { queryParamsHandling: 'preserve' })
    );

    window.open(url, '_self');
  }

  loadMoreComponents(): void {
    const project = this.project();
    if (!project) return;

    this.actions.loadMoreComponents(project.id);
  }

  onReorder(event: CdkDragDrop<NodeModel[]>): void {
    const project = this.project();
    if (!project || !this.canEdit()) return;

    const components = [...this.reorderedComponents()];
    moveItemInArray(components, event.previousIndex, event.currentIndex);
    this.reorderedComponents.set(components);

    const componentIds = components.map((component) => component.id);
    this.actions.reorderComponents(project.id, componentIds).subscribe({
      next: () => {
        this.toastService.showSuccess('project.overview.dialog.toast.reorderComponents.success');
      },
    });
  }

  private handleDeleteComponent(componentId: string): void {
    const project = this.project();
    if (!project) return;

    this.deleteResourceService.deleteComponent({
      rootParentId: project.rootParentId || project.id,
      resourceId: componentId,
      resourceType: ResourceType.Project,
      destroyRef: this.destroyRef,
      onSuccess: () => this.actions.getComponents(project.id),
    });
  }
}
