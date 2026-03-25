import { MetaTagsBuilderService } from '@osf/shared/services/meta-tags-builder.service';

import { Mocked } from 'vitest';

type MetaTagsBuilderMethods =
  | 'buildProjectMetaTagsData'
  | 'buildRegistryMetaTagsData'
  | 'buildPreprintMetaTagsData'
  | 'buildFileMetaTagsData';

export function MetaTagsBuilderServiceMockFactory() {
  return {
    buildProjectMetaTagsData: vi.fn(),
    buildRegistryMetaTagsData: vi.fn(),
    buildPreprintMetaTagsData: vi.fn(),
    buildFileMetaTagsData: vi.fn(),
  } as unknown as Mocked<Pick<MetaTagsBuilderService, MetaTagsBuilderMethods>>;
}
