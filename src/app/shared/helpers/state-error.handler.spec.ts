import { StateContext } from '@ngxs/store';

import { firstValueFrom } from 'rxjs';

import { handleSectionError } from './state-error.handler';

import * as Sentry from '@sentry/angular';

vi.mock('@sentry/angular', () => ({ captureException: vi.fn() }));

interface TestSectionState {
  data: string[];
  isLoading: boolean;
  isSubmitting?: boolean;
  error: string | null;
}

interface TestStateModel {
  sectionA: TestSectionState;
  sectionB: TestSectionState;
}

describe('handleSectionError', () => {
  const baseState: TestStateModel = {
    sectionA: {
      data: ['a'],
      isLoading: true,
      isSubmitting: true,
      error: null,
    },
    sectionB: {
      data: ['b'],
      isLoading: true,
      isSubmitting: true,
      error: null,
    },
  };

  let patchState: ReturnType<typeof vi.fn>;
  let getState: ReturnType<typeof vi.fn>;
  let ctx: StateContext<TestStateModel>;

  beforeEach(() => {
    patchState = vi.fn();
    getState = vi.fn().mockReturnValue(baseState);
    vi.mocked(Sentry.captureException).mockReset();
    ctx = {
      getState,
      patchState,
    } as unknown as StateContext<TestStateModel>;
  });

  it('should capture exception and patch only selected section', () => {
    const error = new Error('Section failed');
    vi.mocked(Sentry.captureException).mockReturnValue('event-id');

    handleSectionError(ctx, 'sectionA', error);

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: {
        'state.section': 'sectionA',
        feature: 'state error section: sectionA',
      },
    });
    expect(patchState).toHaveBeenCalledWith({
      sectionA: {
        data: ['a'],
        isLoading: false,
        isSubmitting: false,
        error: 'Section failed',
      },
    });
  });

  it('should preserve existing section data while updating error flags', () => {
    const error = new Error('Another failure');

    handleSectionError(ctx, 'sectionB', error);

    expect(patchState).toHaveBeenCalledWith({
      sectionB: {
        data: ['b'],
        isLoading: false,
        isSubmitting: false,
        error: 'Another failure',
      },
    });
  });

  it('should return observable that rethrows the same error', async () => {
    const error = new Error('Rethrow me');

    await expect(firstValueFrom(handleSectionError(ctx, 'sectionA', error))).rejects.toThrow('Rethrow me');
  });
});
