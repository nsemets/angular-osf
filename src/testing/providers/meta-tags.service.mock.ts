import { MetaTagsService } from '@osf/shared/services/meta-tags.service';

import { Mocked } from 'vitest';

export function MetaTagsServiceMockFactory() {
  return {
    updateMetaTags: vi.fn(),
  } as unknown as Mocked<Pick<MetaTagsService, 'updateMetaTags'>>;
}
