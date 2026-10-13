import { select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ScientistsNames } from '@osf/shared/constants/scientists.const';
import { CurrentResourceSelectors } from '@osf/shared/stores/current-resource';

@Component({
  selector: 'osf-delete-project-dialog',
  imports: [TranslatePipe, Button, InputText, FormsModule],
  templateUrl: './delete-project-dialog.component.html',
  styleUrl: './delete-project-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteProjectDialogComponent {
  readonly dialogRef = inject(DynamicDialogRef);

  readonly projects = select(CurrentResourceSelectors.getResourceWithChildren);
  readonly hasAdminAccessForAllComponents = select(CurrentResourceSelectors.allResourceChildrenHaveAdminAccess);

  readonly userInput = signal('');

  readonly selectedScientist = ScientistsNames[Math.floor(Math.random() * ScientistsNames.length)];

  readonly isInputValid = computed(() => this.userInput() === this.selectedScientist);

  handleDeleteProject(): void {
    this.dialogRef.close(true);
  }
}
