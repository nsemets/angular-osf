export interface InstitutionSummaryMetricsAttributes {
  report_yearmonth: string;
  user_count: number;
  public_project_count: number;
  private_project_count: number;
  public_registration_count: number;
  embargoed_registration_count: number;
  published_preprint_count: number;
  public_file_count: number;
  storage_byte_count: number;
  monthly_logged_in_user_count: number;
  monthly_active_user_count: number;
}

export interface InstitutionSummaryMetricsRelationships {
  user: {
    data: null;
  };
  institution: {
    links: {
      related: {
        href: string;
        meta: Record<string, unknown>;
      };
    };
    data: {
      id: string;
      type: 'institutions';
    };
  };
}

export interface InstitutionSummaryMetricsData {
  id: string;
  type: 'institution-summary-metrics';
  attributes: InstitutionSummaryMetricsAttributes;
  relationships: InstitutionSummaryMetricsRelationships;
  links: Record<string, unknown>;
}

export interface InstitutionSummaryMetricsJsonApi {
  data: InstitutionSummaryMetricsData;
  meta: {
    version: string;
  };
}
