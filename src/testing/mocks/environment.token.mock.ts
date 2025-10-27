import { ENVIRONMENT_DO_NO_USE } from '@core/constants/environment.token';

/**
 * Mock provider for Angular's `ENVIRONMENT_INITIALIZER` token used in unit tests.
 *
 * This mock is typically used to bypass environment initialization logic
 * that would otherwise be triggered during Angular app startup.
 *
 * @remarks
 * - Useful in test environments where `provideEnvironmentToken` or other initializers
 *   are registered and might conflict with test setups.
 * - Prevents real environment side-effects during test execution.
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   TestBed.configureTestingModule({
 *     providers: [EnvironmentTokenMockProvider],
 *   });
 * });
 * ```
 */
export const EnvironmentTokenMock = {
  provide: ENVIRONMENT_DO_NO_USE,
  useValue: {
    production: false,
    apiDomainUrl: 'http://localhost:8000',
    googleFilePickerApiKey: 'test-api-key',
    googleFilePickerAppId: 'test-app-id',
    googleTagManagerId: 'test-goolge-tag-manager-id',
    addonsApiUrl: 'http://addons.localhost:8000',
    webUrl: 'http://localhost:4200',
    supportEmail: 'support@test.com',
    defaultProvider: 'osf',
    newRelicEnabled: false,
    newRelicInitDistributedTracingEnabled: false,
    newRelicInitPerformanceCaptureMeasures: false,
    newRelicInitPrivacyCookiesEnabled: false,
    newRelicInitAjaxDenyList: [],
    newRelicInfoBeacon: '',
    newRelicInfoErrorBeacon: '',
    newRelicInfoLicenseKey: '',
    newRelicInfoApplicationID: '',
    newRelicInfoSa: 1,
    newRelicLoaderConfigAccountID: '',
    newRelicLoaderConfigTrustKey: '',
    newRelicLoaderConfigAgengID: '',
    newRelicLoaderConfigLicenseKey: '',
    newRelicLoaderConfigApplicationID: '',
  },
};
