/**
 * Production environment configuration for the OSF Angular application.
 *
 * These values are used at runtime to define base URLs, API endpoints,
 * and third-party integrations. This configuration is typically replaced
 * during the Angular build process depending on the target environment.
 */
export const environment = {
  /**
   * Flag indicating whether the app is running in production mode.
   */
  production: false,
  /**
   * Base URL of the OSF web application.
   */
  webUrl: 'https://staging3.osf.io',
  /**
   * Domain URL used for JSON:API v2 services.
   */
  apiDomainUrl: 'https://api.staging3.osf.io',
  /**
   * Base URL for SHARE discovery search (Trove).
   */
  shareTroveUrl: 'https://staging-share.osf.io/trove',
  /**
   * URL for the OSF Addons API (v1).
   */
  addonsApiUrl: 'https://addons.staging3.osf.io/v1',
  /**
   * API endpoint for funder metadata resolution via Crossref.
   */
  funderApiUrl: 'https://api.crossref.org/',
  /**
   * URL for OSF Central Authentication Service (CAS).
   */
  casUrl: 'https://accounts.staging3.osf.io',
  /**
   * Site key used for reCAPTCHA v2 validation in staging.
   */
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  /**
   * Twitter handle for OSF.
   */
  twitterHandle: 'OSFramework',
  /**
   * Facebook App ID used for social authentication or sharing.
   */
  facebookAppId: '1022273774556662',
  /**
   * Support contact email for users.
   */
  supportEmail: 'support@osf.io',
  /**
   * Default provider for OSF content and routing.
   */
  defaultProvider: 'osf',
  dataciteTrackerRepoId: null,
  dataciteTrackerAddress: 'https://analytics.datacite.org/api/metric',
  newRelic: {
    enabled: false,
    init: {
      distributed_tracing: { enabled: true },
      performance: { capture_measures: true },
      privacy: { cookies_enabled: true },
      ajax: { deny_list: ['bam.nr-data.net'] },
    },
    info: {
      beacon: 'bam.nr-data.net',
      errorBeacon: 'bam.nr-data.net',
      licenseKey: '704513e63b',
      applicationID: '1835137194',
      sa: 1,
    },
    loader_config: {
      accountID: '772413',
      trustKey: '772413',
      agentID: '1835137194',
      licenseKey: '704513e63b',
      applicationID: '1835137194',
    },
  },
};
