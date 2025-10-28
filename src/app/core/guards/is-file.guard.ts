import { Store } from '@ngxs/store';

import { map, switchMap } from 'rxjs/operators';

import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';

import { CurrentResourceSelectors, GetResource } from '@osf/shared/stores/current-resource';

import { CurrentResourceType } from '../../shared/enums';

export const isFileGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const store = inject(Store);
  const router = inject(Router);

  const id = segments[0]?.path;
  const isMetadataPath = segments[1]?.path === 'metadata';

  const urlObj = new URL(window.location.href);
  const viewOnly = urlObj.searchParams.get('view_only');
  const extras = viewOnly ? { queryParams: { view_only: viewOnly } } : {};

  if (!id) {
    return false;
  }

  const currentResource = store.selectSnapshot(CurrentResourceSelectors.getCurrentResource);
  if (currentResource && currentResource.id === id) {
    if (currentResource.type === CurrentResourceType.Files) {
      if (isMetadataPath) {
        return true;
      }
      if (currentResource.parentId) {
        router.navigate(['/', currentResource.parentId, 'files', id], extras);
        return false;
      }
    }

    return currentResource.type === CurrentResourceType.Files;
  }

  return store.dispatch(new GetResource(id)).pipe(
    switchMap(() => store.select(CurrentResourceSelectors.getCurrentResource)),
    map((resource) => {
      if (!resource || resource.id !== id) {
        return false;
      }

      if (resource.type === CurrentResourceType.Files) {
        if (isMetadataPath) {
          return true;
        }
        if (resource.parentId) {
          router.navigate(['/', resource.parentId, 'files', id], extras);
          return false;
        }
      }
      return resource.type === CurrentResourceType.Files;
    })
  );
};
