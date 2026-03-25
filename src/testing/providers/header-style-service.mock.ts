import { HeaderStyleService } from '@osf/shared/services/header-style.service';

import { Mock } from 'vitest';

export type HeaderStyleServiceMockType = Partial<HeaderStyleService> & {
  applyHeaderStyles: Mock;
  resetToDefaults: Mock;
};

export const HeaderStyleServiceMock = {
  simple(): HeaderStyleServiceMockType {
    return {
      applyHeaderStyles: vi.fn(),
      resetToDefaults: vi.fn(),
    };
  },
};
