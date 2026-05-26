export interface RelationshipLinks {
  related: RelationshipLink;
  self?: RelationshipLink;
}

export interface ResourceDataLinksJsonApi {
  html?: string;
  self: string;
  iri?: string;
  download?: string;
  delete?: string;
}

export interface ResourceLinksJsonApi {
  html: string;
  self: string;
  iri: string;
}

export interface PaginationLinks {
  self?: string;
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

interface RelationshipLink {
  href: string;
  meta?: Record<string, unknown>;
}
