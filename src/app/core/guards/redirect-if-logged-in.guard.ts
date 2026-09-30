import { Store } from '@ngxs/store';

import { map, switchMap, take } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { GetCurrentUser, UserSelectors } from '@osf/core/store/user';

export const redirectIfLoggedInGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const store = inject(Store);
  const router = inject(Router);

  return store.dispatch(GetCurrentUser).pipe(
    switchMap(() =>
      store.select(UserSelectors.isAuthenticated).pipe(
        take(1),
        map((isAuthenticated) => {
          if (isAuthenticated) {
            router.navigate(['/dashboard']);
            return false;
          }

          return true;
        })
      )
    )
  );
};
