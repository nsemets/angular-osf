import { FieldType } from '../enums';

export interface PageSchema {
  id: string;
  title: string;
  description?: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  displayText: string;
  exampleText?: string;
  helpText?: string;
  paragraphText?: string;
  fieldType?: FieldType;
  options?: string[];
  required: boolean;
  groupKey?: string;
  responseKey?: string;
}
