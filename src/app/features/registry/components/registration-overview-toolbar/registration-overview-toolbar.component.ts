import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserSelectors } from '@core/store/user';
import { SocialsShareButtonComponent } from '@osf/shared/components/socials-share-button/socials-share-button.component';
import { ToolbarResource } from '@osf/shared/models/toolbar-resource.model';
import { ToastService } from '@osf/shared/services/toast.service';
import { AddResourceToBookmarks, BookmarksSelectors, RemoveResourceFromBookmarks } from '@osf/shared/stores/bookmarks';
import { GetMyBookmarks, MyResourcesSelectors } from '@osf/shared/stores/my-resources';

@Component({
  selector: 'osf-registration-overview-toolbar',
  imports: [Button, Tooltip, SocialsShareButtonComponent, TranslatePipe],
  templateUrl: './registration-overview-toolbar.component.html',
  styleUrl: './registration-overview-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationOverviewToolbarComponent {
  private store = inject(Store);
  private toastService = inject(ToastService);

  destroyRef = inject(DestroyRef);
  isBookmarked = signal(false);

  isCollectionsRoute = input<boolean>(false);
  currentResource = input.required<ToolbarResource>();

  isBookmarksLoading = select(MyResourcesSelectors.getBookmarksLoading);
  isBookmarksSubmitting = select(BookmarksSelectors.getBookmarksCollectionIdSubmitting);
  bookmarksCollectionId = select(BookmarksSelectors.getBookmarksCollectionId);
  bookmarkedProjects = select(MyResourcesSelectors.getBookmarks);
  isAuthenticated = select(UserSelectors.isAuthenticated);

  actions = createDispatchMap({ getMyBookmarks: GetMyBookmarks });

  constructor() {
    effect(() => {
      const bookmarksId = this.bookmarksCollectionId();
      const resource = this.currentResource();
      if (!bookmarksId || !resource) return;
      this.store.dispatch(new GetMyBookmarks(bookmarksId, 1, 100, {}, resource.resourceType));
    });

    effect(() => {
      const resource = this.currentResource();
      const bookmarks = this.bookmarkedProjects();
      if (!resource || !bookmarks?.length) {
        this.isBookmarked.set(false);
        return;
      }
      this.isBookmarked.set(bookmarks.some((bookmark) => bookmark.id === resource.id));
    });
  }

  toggleBookmark(): void {
    const resource = this.currentResource();
    const bookmarksId = this.bookmarksCollectionId();
    if (!resource || !bookmarksId) return;

    const newBookmarkState = !this.isBookmarked();

    if (!newBookmarkState) {
      this.store
        .dispatch(new RemoveResourceFromBookmarks(bookmarksId, resource.id, resource.resourceType))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isBookmarked.set(newBookmarkState);
            this.toastService.showSuccess('project.overview.dialog.toast.bookmark.remove');
          },
        });
    } else {
      this.store
        .dispatch(new AddResourceToBookmarks(bookmarksId, resource.id, resource.resourceType))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isBookmarked.set(newBookmarkState);
            this.toastService.showSuccess('project.overview.dialog.toast.bookmark.add');
          },
        });
    }
  }
}
