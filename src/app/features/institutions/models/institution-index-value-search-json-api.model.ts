import { JsonApiResponse } from '@osf/core/models';

export interface InstitutionSearchResultCount {
  attributes: {
    cardSearchResultCount: number;
  };
  id: string;
  type: 'search-result';
  relationships: {
    indexCard: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface InstitutionIndexCardFilter {
  attributes: {
    resourceIdentifier: string[];
    resourceMetadata: {
      displayLabel: { '@value': string }[];
      '@id': string;
    };
  };
  id: string;
  type: 'index-card';
}

export type InstitutionIndexValueSearchIncludedJsonApi = InstitutionSearchResultCount | InstitutionIndexCardFilter;

export interface InstitutionIndexValueSearchJsonApi
  extends JsonApiResponse<null, InstitutionIndexValueSearchIncludedJsonApi[]> {
  data: null;
  included: InstitutionIndexValueSearchIncludedJsonApi[];
}

export interface InstitutionSearchFilter {
  id: string;
  label: string;
  value: string;
  count?: number;
}
