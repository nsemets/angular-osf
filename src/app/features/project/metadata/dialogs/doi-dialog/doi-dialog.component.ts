import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ProjectOverview } from '@osf/features/project/overview/models';

@Component({
  selector: 'osf-doi-dialog',
  imports: [Button, TranslatePipe],
  templateUrl: './doi-dialog.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoiDialogComponent {
  protected dialogRef = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);

  get currentProject(): ProjectOverview | null {
    return this.config.data?.currentProject || null;
  }

  save(): void {
    this.dialogRef.close({
      confirmed: true,
      projectId: this.currentProject?.id,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
