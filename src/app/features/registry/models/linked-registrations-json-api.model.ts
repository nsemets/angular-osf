import { RegistrationReviewStates } from '@shared/enums';

export interface LinkedRegistrationJsonApi {
  id: string;
  type: 'registrations';
  attributes: {
    title: string;
    description: string;
    category: string;
    custom_citation: string;
    date_created: string;
    date_modified: string;
    date_registered?: string;
    date_withdrawn?: string | null;
    registration: boolean;
    reviews_state: RegistrationReviewStates;
    preprint: boolean;
    fork: boolean;
    collection: boolean;
    tags: string[];
    access_requests_enabled: boolean;
    node_license?: {
      copyright_holders: string[];
      year: string | null;
    };
    analytics_key: string;
    current_user_can_comment: boolean;
    current_user_permissions: string[];
    current_user_is_contributor: boolean;
    current_user_is_contributor_or_group_member: boolean;
    wiki_enabled: boolean;
    public: boolean;
    ia_url?: string | null;
    article_doi?: string | null;
    pending_embargo_approval: boolean;
    pending_embargo_termination_approval: boolean;
    embargoed: boolean;
    pending_registration_approval: boolean;
    archiving: boolean;
    pending_withdrawal: boolean;
    withdrawn: boolean;
    has_project: boolean;
    embargo_end_date?: string | null;
    withdrawal_justification?: string | null;
    has_data: boolean;
    has_analytic_code: boolean;
    has_materials: boolean;
    has_papers: boolean;
    has_supplements: boolean;
    registration_supplement: string;
    registered_meta: {
      summary: {
        extra: unknown[];
        value: string;
      };
      uploader: {
        extra: unknown[];
        value: string;
      };
    };
    registration_responses: {
      summary: string;
      uploader: unknown[];
    };
    provider_specific_metadata: unknown[];
    subjects: {
      id: string;
      text: string;
    }[][];
  };
  relationships: {
    license: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'licenses';
      };
    };
    children: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    collected_in: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    comments: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    contributors: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    bibliographic_contributors: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    implicit_contributors: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    files: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    wikis: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    forks: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    node_links: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    linked_by_nodes: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    linked_by_registrations: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    identifiers: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    affiliated_institutions: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
        self: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    region: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'regions';
      };
    };
    parent: {
      data: null | {
        id: string;
        type: 'registrations';
      };
    };
    root: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'registrations';
      };
    };
    logs: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    linked_nodes: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
        self: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    linked_registrations: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
        self: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    view_only_links: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    citation: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'citation';
      };
    };
    storage: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'node-storage';
      };
    };
    cedar_metadata_records: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    registered_by: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'users';
      };
    };
    registered_from: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'nodes';
      };
    };
    registration_schema: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'registration-schemas';
      };
    };
    provider: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'registration-providers';
      };
    };
    review_actions: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    requests: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    schema_responses: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
    original_response: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
      data: {
        id: string;
        type: 'schema_responses';
      };
    };
    resources: {
      links: {
        related: {
          href: string;
          meta: Record<string, unknown>;
        };
      };
    };
  };
  links: {
    html: string;
    self: string;
    iri: string;
  };
}

export interface LinkedRegistrationsJsonApiResponse {
  data: LinkedRegistrationJsonApi[];
  meta: {
    total: number;
    per_page: number;
    version: string;
  };
  links: {
    self: string;
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
    meta: {
      total: number;
      per_page: number;
    };
  };
}
