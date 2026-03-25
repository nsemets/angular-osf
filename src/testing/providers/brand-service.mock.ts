import { BrandService } from '@osf/shared/services/brand.service';

import { Mock } from 'vitest';

export type BrandServiceMockType = Partial<BrandService> & {
  applyBranding: Mock;
  resetBranding: Mock;
};

export const BrandServiceMock = {
  simple(): BrandServiceMockType {
    return {
      applyBranding: vi.fn(),
      resetBranding: vi.fn(),
    };
  },
};
