import { HelpScoutService } from '@core/services/help-scout.service';

import { Mocked } from 'vitest';

export function HelpScoutServiceMockFactory() {
  return {
    setResourceType: vi.fn(),
    unsetResourceType: vi.fn(),
  } as unknown as Mocked<HelpScoutService>;
}
