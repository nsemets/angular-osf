import { AsyncStateWithTotalCount } from '@shared/models';

export interface AsyncStateWithLinksModel<T> extends AsyncStateWithTotalCount<T> {
  links?: {
    first?: { href: string };
    next?: { href: string };
    prev?: { href: string };
    last?: { href: string };
  };
}
