import { Button, ButtonDirective } from 'primeng/button';
import { Calendar } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';

import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CedarMetadataDataTemplateJsonApi } from '@osf/features/project/metadata/models';

interface FieldSchema {
  type?: string;
  format?: string;
  maxLength?: number;
  items?: FieldSchema;
  _ui?: {
    inputType?: string;
  };
}

@Component({
  selector: 'osf-cedar-template-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, ButtonDirective, InputTextModule, InputTextarea, Calendar],
  templateUrl: './cedar-template-form.component.html',
  styleUrl: './cedar-template-form.component.scss',
})
export class CedarTemplateFormComponent implements OnInit {
  template = input.required<CedarMetadataDataTemplateJsonApi>();
  formData = signal<Record<string, unknown>>({});

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Template received:', this.template());
    this.initializeFormData();
  }

  private initializeFormData() {
    const sections = this.getSectionOrder();
    const initialData: Record<string, unknown> = {};

    sections.forEach((section) => {
      const schema = this.getSectionSchema(section);
      if (schema) {
        initialData[section] = this.getDefaultValue(schema);
      }
    });

    this.formData.set(initialData);
  }

  private getDefaultValue(schema: FieldSchema): unknown {
    if (schema.type === 'array') {
      return [];
    } else if (schema.type === 'object') {
      return {};
    } else if (schema.type === 'string') {
      return '';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return null;
    } else if (schema.type === 'boolean') {
      return false;
    }
    return null;
  }

  getSectionOrder(): string[] {
    return this.template()?.attributes?.template?._ui?.order ?? [];
  }

  getSectionLabel(section: string): string {
    return this.template()?.attributes?.template?._ui?.propertyLabels?.[section] ?? section;
  }

  getSectionDescription(section: string): string {
    return this.template()?.attributes?.template?._ui?.propertyDescriptions?.[section] ?? '';
  }

  getSectionSchema(section: string): FieldSchema | undefined {
    return this.template()?.attributes?.template?.properties?.[section] as FieldSchema;
  }

  getFieldValue(section: string): unknown {
    return this.formData()[section];
  }

  onFieldChange(section: string, value: unknown): void {
    this.formData.update((fd) => ({ ...fd, [section]: value }));
  }

  getInputType(schema: FieldSchema): string {
    if (schema._ui?.inputType) {
      return schema._ui.inputType;
    }

    if (schema.type === 'string') {
      if (schema.format === 'date' || schema.format === 'date-time') {
        return 'date';
      }
      return 'text';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return 'number';
    } else if (schema.type === 'boolean') {
      return 'checkbox';
    }

    return 'text';
  }

  isTextArea(schema: FieldSchema): boolean {
    return schema._ui?.inputType === 'textarea' || (schema.type === 'string' && (schema.maxLength ?? 0) > 100);
  }

  isArray(schema: FieldSchema): boolean {
    return schema.type === 'array';
  }

  getArrayItems(section: string): unknown[] {
    const value = this.getFieldValue(section);
    return Array.isArray(value) ? value : [];
  }

  addArrayItem(section: string): void {
    const schema = this.getSectionSchema(section);
    const defaultValue = schema?.items ? this.getDefaultValue(schema.items) : '';

    this.formData.update((fd) => {
      const currentValue = fd[section];
      const newArray = Array.isArray(currentValue) ? [...currentValue] : [];
      newArray.push(defaultValue);
      return { ...fd, [section]: newArray };
    });
  }

  removeArrayItem(section: string, index: number): void {
    this.formData.update((fd) => {
      const currentValue = fd[section];
      if (Array.isArray(currentValue)) {
        const newArray = [...currentValue];
        newArray.splice(index, 1);
        return { ...fd, [section]: newArray };
      }
      return fd;
    });
  }

  updateArrayItem(section: string, index: number, value: unknown): void {
    this.formData.update((fd) => {
      const currentValue = fd[section];
      if (Array.isArray(currentValue)) {
        const newArray = [...currentValue];
        newArray[index] = value;
        return { ...fd, [section]: newArray };
      }
      return fd;
    });
  }

  onSubmit(): void {
    console.log('Form submitted:', this.formData());
    // Here you would send formData() to your backend or process it as needed
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
