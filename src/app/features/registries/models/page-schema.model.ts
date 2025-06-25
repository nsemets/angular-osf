export interface PageSchema {
  id: string;
  title: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  groupKey?: string;
  responseKey?: string;
}

export enum QuestionType {
  Text = 'text',
  TextArea = 'textarea',
  Select = 'select',
  MultiSelect = 'multi-select',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Date = 'date',
  Number = 'number',
  Email = 'email',
  Url = 'url',
}
