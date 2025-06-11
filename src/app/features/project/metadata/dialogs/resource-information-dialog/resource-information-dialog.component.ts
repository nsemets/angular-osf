import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProjectOverview } from '@osf/features/project/overview/models';

interface ResourceInformationForm {
  resourceType: FormControl<string>;
  resourceLanguage: FormControl<string>;
}

@Component({
  selector: 'osf-resource-information-dialog',
  imports: [Button, Select, TranslatePipe, ReactiveFormsModule],
  templateUrl: './resource-information-dialog.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceInformationDialogComponent implements OnInit {
  protected dialogRef = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);

  resourceForm = new FormGroup<ResourceInformationForm>({
    resourceType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    resourceLanguage: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  // Resource type options - based on common research resource types
  resourceTypeOptions = [
    { label: 'Audiovisual', value: 'audiovisual' },
    { label: 'Book', value: 'book' },
    { label: 'Book Chapter', value: 'book-chapter' },
    { label: 'Collection', value: 'collection' },
    { label: 'Computational Notebook', value: 'computational-notebook' },
    { label: 'Conference Paper', value: 'conference-paper' },
    { label: 'Conference Proceeding', value: 'conference-proceeding' },
    { label: 'Data Paper', value: 'data-paper' },
    { label: 'Dataset', value: 'dataset' },
    { label: 'Dissertation', value: 'dissertation' },
    { label: 'Event', value: 'event' },
    { label: 'Image', value: 'image' },
    { label: 'Interactive Resource', value: 'interactive-resource' },
    { label: 'Journal Article', value: 'journal-article' },
    { label: 'Model', value: 'model' },
    { label: 'Output Management Plan', value: 'output-management-plan' },
    { label: 'Peer Review', value: 'peer-review' },
    { label: 'Physical Object', value: 'physical-object' },
    { label: 'Preprint', value: 'preprint' },
    { label: 'Report', value: 'report' },
    { label: 'Service', value: 'service' },
    { label: 'Software', value: 'software' },
    { label: 'Sound', value: 'sound' },
    { label: 'Standard', value: 'standard' },
    { label: 'Text', value: 'text' },
    { label: 'Thesis', value: 'thesis' },
    { label: 'Workflow', value: 'workflow' },
    { label: 'Other', value: 'other' },
  ];

  // Language options - ISO 639-1 language codes
  languageOptions = [
    { label: 'Arabic', value: 'ar' },
    { label: 'Chinese (Simplified)', value: 'zh-CN' },
    { label: 'Chinese (Traditional)', value: 'zh-TW' },
    { label: 'Dutch', value: 'nl' },
    { label: 'English', value: 'en' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Italian', value: 'it' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Russian', value: 'ru' },
    { label: 'Spanish', value: 'es' },
    { label: 'Other', value: 'other' },
  ];

  get currentProject(): ProjectOverview | null {
    return this.config.data?.currentProject || null;
  }

  get isEditMode(): boolean {
    return !!this.currentProject?.category;
  }

  ngOnInit(): void {
    // Pre-populate the form if editing existing resource information
    if (this.currentProject?.category) {
      this.resourceForm.patchValue({
        resourceType: this.currentProject.category,
        resourceLanguage: '',
      });
    }
  }

  save(): void {
    if (this.resourceForm.valid) {
      const formValue = this.resourceForm.getRawValue();
      this.dialogRef.close({
        resourceType: formValue.resourceType,
        resourceLanguage: formValue.resourceLanguage,
        projectId: this.currentProject?.id,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
