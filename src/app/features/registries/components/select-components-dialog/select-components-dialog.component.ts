import { TranslatePipe } from '@ngx-translate/core';

import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Project } from '../../models';

@Component({
  selector: 'osf-select-components-dialog',
  imports: [TranslatePipe, Tree, Button],
  templateUrl: './select-components-dialog.component.html',
  styleUrl: './select-components-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponentsDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  selectedComponents: TreeNode[] = [];
  components: TreeNode[] = [];

  constructor() {
    this.components = this.config.data.components.map(this.mapProjectToTreeNode);
    console.log('SelectComponentsDialogComponent initialized with components:', this.components);
  }

  private mapProjectToTreeNode = (project: Project): TreeNode => {
    this.selectedComponents.push({
      key: project.id,
    });
    return {
      label: project.title,
      data: project.id,
      key: project.id,
      selectable: true,
      expanded: true,
      children: project.children?.map(this.mapProjectToTreeNode) ?? [],
    };
  };

  continue() {
    this.dialogRef.close(this.selectedComponents);
  }
}
