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
  selector: 'osf-delete-component-dialog',
  imports: [TranslatePipe, Button, InputText, FormsModule],
  templateUrl: './delete-component-dialog.component.html',
  styleUrl: './delete-component-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteComponentDialogComponent {
  readonly dialogRef = inject(DynamicDialogRef);

  readonly components = select(CurrentResourceSelectors.getResourceWithChildren);
  readonly hasAdminAccessForAllComponents = select(CurrentResourceSelectors.allResourceChildrenHaveAdminAccess);

  readonly userInput = signal('');

  readonly selectedScientist = ScientistsNames[Math.floor(Math.random() * ScientistsNames.length)];

  readonly isInputValid = computed(() => this.userInput() === this.selectedScientist);

  readonly hasSubComponents = computed(() => this.components()?.length > 1);

  handleDeleteComponent(): void {
    this.dialogRef.close(true);
  }
}
