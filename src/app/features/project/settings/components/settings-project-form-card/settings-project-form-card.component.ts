import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NodeData } from '@osf/features/my-projects/entities/node-response.model';
import { ProjectFormControls } from '@shared/entities/create-project-form-controls.enum';

@Component({
  selector: 'osf-settings-project-form-card',
  imports: [Button, Card, FormsModule, InputText, Textarea, TranslatePipe, ReactiveFormsModule],
  templateUrl: './settings-project-form-card.component.html',
  styleUrl: '../../settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SettingsProjectFormCardComponent {
  projectDetails = input.required<NodeData>();
  formGroup = input.required<FormGroup>();
  submitForm = output<{ title: string; description: string }>();
  deleteProject = output<void>();

  protected readonly ProjectFormControls = ProjectFormControls;

  resetForm(): void {
    this.formGroup().patchValue({ ...this.projectDetails().attributes });
  }
}
