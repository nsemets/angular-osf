import { ButtonDirective } from 'primeng/button';
import { Calendar } from 'primeng/calendar';
import { Checkbox } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FieldSchema } from '@osf/features/project/metadata/models';

@Component({
  selector: 'osf-dynamic-field',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Calendar, Checkbox, ButtonDirective, Textarea],
  templateUrl: './osf-dynamic-field.component.html',
})
export class OsfDynamicFieldComponent {
  @Input() schema: FieldSchema | null = null;
  @Input() value: unknown = null;
  @Output() valueChange = new EventEmitter<unknown>();

  // Expose Object.keys to template
  Object = Object;

  getFieldLabel(): string {
    if (!this.schema) return '';
    return this.schema['schema:name'] || this.schema.title || '';
  }

  getFieldDescription(): string {
    if (!this.schema) return '';
    return this.schema['schema:description'] || this.schema.description || '';
  }

  getInputType(): string {
    if (!this.schema) return 'text';

    if (this.schema._ui?.inputType) {
      return this.schema._ui.inputType;
    }

    if (this.schema.type === 'string') {
      if (this.schema.format === 'date' || this.schema.format === 'date-time') {
        return 'date';
      }
      return 'text';
    } else if (this.schema.type === 'number' || this.schema.type === 'integer') {
      return 'number';
    } else if (this.schema.type === 'boolean') {
      return 'checkbox';
    }

    return 'text';
  }

  isTextArea(): boolean {
    if (!this.schema) return false;
    return (
      this.schema._ui?.inputType === 'textarea' || (this.schema.type === 'string' && (this.schema.maxLength ?? 0) > 100)
    );
  }

  isArray(): boolean {
    return this.schema?.type === 'array';
  }

  isObject(): boolean {
    return this.schema?.type === 'object';
  }

  isDate(): boolean {
    return this.getInputType() === 'date';
  }

  isCheckbox(): boolean {
    return this.getInputType() === 'checkbox';
  }

  valueArray(): unknown[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  getObjectValue(): Record<string, unknown> {
    return (this.value as Record<string, unknown>) || {};
  }

  getObjectPropertyValue(propKey: string): unknown {
    const objValue = this.getObjectValue();
    return objValue[propKey];
  }

  getDateValue(): Date | null {
    return this.value as Date | null;
  }

  getArrayItemSchema(): FieldSchema | null {
    return this.schema?.items || null;
  }

  onObjectPropertyChange(propKey: string, newValue: unknown): void {
    const currentValue = this.getObjectValue();
    const updatedValue = { ...currentValue, [propKey]: newValue };
    this.value = updatedValue;
    this.onValueChange();
  }

  addItem(): void {
    if (!Array.isArray(this.value)) {
      this.value = [];
    }

    const defaultValue = this.getDefaultValue(this.schema?.items);
    (this.value as unknown[]).push(defaultValue);
    this.onValueChange();
  }

  removeItem(index: number): void {
    if (Array.isArray(this.value)) {
      this.value.splice(index, 1);
      this.onValueChange();
    }
  }

  updateArrayItem(index: number, newValue: unknown): void {
    if (Array.isArray(this.value)) {
      this.value[index] = newValue;
      this.onValueChange();
    }
  }

  private getDefaultValue(schema?: FieldSchema): unknown {
    if (!schema) return '';

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
    return '';
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onValueChange();
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.onValueChange();
  }

  onDateChange(date: Date | null): void {
    this.value = date;
    this.onValueChange();
  }

  onValueChange(): void {
    this.valueChange.emit(this.value);
  }
}
