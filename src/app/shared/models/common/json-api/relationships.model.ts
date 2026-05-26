import { RelationshipLinks } from './links.model';
import { JsonApiResourceRef } from './resource.model';

export interface RelatedCountRel {
  links: {
    related: {
      href?: string;
      meta: RelatedCountMeta;
    };
  };
}

export interface RelatedCountMeta {
  count: number;
}

export interface ToOneRel<TType extends string = string> {
  data: JsonApiResourceRef<TType> | null;
  links: RelationshipLinks;
}

export interface ToManyRel<TType extends string = string> {
  data: JsonApiResourceRef<TType>[] | null;
  links: RelationshipLinks;
}
