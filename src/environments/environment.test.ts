/**
 * Test osf environment configuration for the OSF Angular application.
 */
export const environment = {
  production: false,
  webUrl: 'https://test.osf.io',
  apiDomainUrl: 'https://api.test.osf.io',
  shareTroveUrl: 'https://staging-share.osf.io/trove',
  addonsApiUrl: 'https://addons.test.osf.io/v1',
  funderApiUrl: 'https://api.crossref.org/',
  casUrl: 'https://accounts.test.osf.io',
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  twitterHandle: 'OSFramework',
  facebookAppId: '1022273774556662',
  supportEmail: 'support@osf.io',
  defaultProvider: 'osf',
  dataciteTrackerRepoId: null,
  dataciteTrackerAddress: 'https://analytics.datacite.org/api/metric',
  newRelic: {
    enabled: false,
    init: {
      distributed_tracing: { enabled: false },
      performance: { capture_measures: false },
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
  sentryDsn: '',
  googleTagManagerId: '',
  googleFilePickerApiKey: '',
  googleFilePickerAppId: 0,
};
