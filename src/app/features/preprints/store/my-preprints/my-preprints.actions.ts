import { SearchFilters } from '@shared/models';

export class FetchMyPreprints {
  static readonly type = '[My Preprints] Fetch My Preprints';

  constructor(
    public pageNumber: number,
    public pageSize: number,
    public filters: SearchFilters
  ) {}
}
