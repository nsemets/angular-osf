import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProjectOverview } from '@osf/features/project/overview/models';

@Component({
  selector: 'osf-description-dialog',
  imports: [Button, TranslatePipe, Textarea, ReactiveFormsModule],
  templateUrl: './description-dialog.component.html',
  styleUrl: './description-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionDialogComponent implements OnInit {
  openEditDescriptionDialog = output<void>();

  protected dialogRef = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);

  descriptionControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  get currentProject(): ProjectOverview | null {
    return this.config.data ? this.config.data.currentProject || null : null;
  }

  ngOnInit(): void {
    if (this.currentProject && this.currentProject.description) {
      this.descriptionControl.setValue(this.currentProject.description);
    }
  }

  save(): void {
    if (this.descriptionControl.valid) {
      this.dialogRef.close({
        description: this.descriptionControl.value,
        projectId: this.currentProject ? this.currentProject.id : undefined,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
