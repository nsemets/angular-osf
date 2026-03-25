import { BrowserTabService } from '@osf/shared/services/browser-tab.service';

import { Mock } from 'vitest';

export type BrowserTabServiceMockType = Partial<BrowserTabService> & {
  updateTabStyles: Mock;
  resetToDefaults: Mock;
};

export const BrowserTabServiceMock = {
  simple(): BrowserTabServiceMockType {
    return {
      updateTabStyles: vi.fn(),
      resetToDefaults: vi.fn(),
    };
  },
};
