import { ButtonDirective } from 'primeng/button';

import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';

import { CedarMetadataDataTemplate, FieldSchema } from '@osf/features/project/metadata/models';

import { OsfDynamicFieldComponent } from '../osf-dynamic-field/osf-dynamic-field.component';

@Component({
  selector: 'osf-cedar-template-form',
  standalone: true,
  imports: [CommonModule, OsfDynamicFieldComponent, ButtonDirective],
  templateUrl: './cedar-template-form.component.html',
  styleUrl: './cedar-template-form.component.scss',
})
export class CedarTemplateFormComponent implements OnInit {
  template = input.required<CedarMetadataDataTemplate>();
  formData = signal<Record<string, unknown>>({});

  ngOnInit() {
    // Template is received as input, no need to set it from history.state
    // If you need to initialize formData based on template, you can do it here
    console.log('Template received:', this.template());
  }

  getSectionOrder() {
    return this.template()?.attributes?.template?._ui?.order ?? [];
  }

  getSectionLabel(section: string) {
    return this.template()?.attributes?.template?._ui?.propertyLabels?.[section] ?? section;
  }

  getSectionDescription(section: string) {
    return this.template()?.attributes?.template?._ui?.propertyDescriptions?.[section] ?? '';
  }

  getSectionSchema(section: string) {
    return this.template()?.attributes?.template?.properties?.[section] as FieldSchema;
  }

  onFieldChange(section: string, value: string | boolean) {
    this.formData.update((fd) => ({ ...fd, [section]: value }));
  }

  onSubmit() {
    // Here you would send formData() to your backend or process it as needed
    console.log('Form submitted:', this.formData());
  }
}
