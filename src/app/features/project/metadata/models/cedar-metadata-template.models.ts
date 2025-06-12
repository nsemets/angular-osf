import { PaginationLinks } from '@osf/features/project/settings/models';

export interface CedarMetadataDataTemplate {
  id: string;
  type: 'cedar-metadata-templates';
  attributes: {
    schema_name: string;
    cedar_id: string;
    template: CedarTemplate;
  };
}

export interface CedarTemplate {
  '@id': string;
  '@type': string;
  type: string;
  title: string;
  description: string;
  $schema: string;
  '@context': CedarTemplateContext;
  required: string[];
  properties: Record<string, unknown>;
  _ui: {
    order: string[];
    propertyLabels: Record<string, string>;
    propertyDescriptions: Record<string, string>;
  };
}

export interface CedarTemplateContext {
  pav: string;
  xsd: string;
  bibo: string;
  oslc: string;
  schema: string;
  'schema:name': {
    '@type': string;
  };
  'pav:createdBy': {
    '@type': string;
  };
  'pav:createdOn': {
    '@type': string;
  };
  'oslc:modifiedBy': {
    '@type': string;
  };
  'pav:lastUpdatedOn': {
    '@type': string;
  };
  'schema:description': {
    '@type': string;
  };
}
export interface CedarMetadataTemplate {
  id: string;
  type: 'cedar-metadata-templates';
  attributes: {
    schema_name: string;
    cedar_id: string;
    template: CedarTemplate;
  };
}

export interface CedarTemplate {
  '@id': string;
  '@type': string;
  type: string;
  title: string;
  $schema: string;
  '@context': CedarTemplateContext;
  required: string[];
  properties: Record<string, unknown>;
  _ui: {
    order: string[];
    propertyLabels: Record<string, string>;
    propertyDescriptions: Record<string, string>;
  };
}

export interface CedarTemplateContext {
  pav: string;
  xsd: string;
  bibo: string;
  oslc: string;
  schema: string;
  'schema:name': {
    '@type': string;
  };
  'pav:createdBy': {
    '@type': string;
  };
  'pav:createdOn': {
    '@type': string;
  };
  'oslc:modifiedBy': {
    '@type': string;
  };
  'pav:lastUpdatedOn': {
    '@type': string;
  };
  'schema:description': {
    '@type': string;
  };
}

export interface CedarMetadataTemplate {
  data: CedarMetadataDataTemplate[];
  links: PaginationLinks;
}

export interface FieldSchema {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  maxLength?: number;
  items?: FieldSchema;
  properties?: Record<string, FieldSchema>;
  required?: string[];
  _ui?: {
    inputType?: string;
    order?: string[];
    propertyLabels?: Record<string, string>;
    propertyDescriptions?: Record<string, string>;
  };
  'schema:name'?: string;
  'schema:description'?: string;
}
