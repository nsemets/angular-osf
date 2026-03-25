import { PrerenderReadyService } from '@core/services/prerender-ready.service';

import { Mocked } from 'vitest';

export function PrerenderReadyServiceMockFactory() {
  return {
    setNotReady: vi.fn(),
    setReady: vi.fn(),
  } as unknown as Mocked<PrerenderReadyService>;
}
