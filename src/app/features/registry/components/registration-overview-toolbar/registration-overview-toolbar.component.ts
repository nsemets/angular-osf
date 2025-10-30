import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserSelectors } from '@core/store/user';
import { SocialsShareButtonComponent } from '@osf/shared/components/socials-share-button/socials-share-button.component';
import { ToolbarResource } from '@osf/shared/models/toolbar-resource.model';
import { ToastService } from '@osf/shared/services/toast.service';
import {
  AddResourceToBookmarks,
  BookmarksSelectors,
  GetResourceBookmark,
  RemoveResourceFromBookmarks,
} from '@osf/shared/stores/bookmarks';

@Component({
  selector: 'osf-registration-overview-toolbar',
  imports: [Button, Tooltip, SocialsShareButtonComponent, TranslatePipe],
  templateUrl: './registration-overview-toolbar.component.html',
  styleUrl: './registration-overview-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationOverviewToolbarComponent {
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  currentResource = input.required<ToolbarResource>();

  isBookmarked = signal(false);

  bookmarksCollectionId = select(BookmarksSelectors.getBookmarksCollectionId);
  bookmarks = select(BookmarksSelectors.getBookmarks);
  isBookmarksLoading = select(BookmarksSelectors.areBookmarksLoading);
  isBookmarksSubmitting = select(BookmarksSelectors.getBookmarksCollectionIdSubmitting);
  isAuthenticated = select(UserSelectors.isAuthenticated);

  actions = createDispatchMap({
    getResourceBookmark: GetResourceBookmark,
    addResourceToBookmarks: AddResourceToBookmarks,
    removeResourceFromBookmarks: RemoveResourceFromBookmarks,
  });

  constructor() {
    effect(() => {
      const bookmarksCollectionId = this.bookmarksCollectionId();
      const resource = this.currentResource();

      if (!bookmarksCollectionId || !resource) return;

      this.actions.getResourceBookmark(bookmarksCollectionId, resource.id, resource.resourceType);
    });

    effect(() => {
      const resource = this.currentResource();
      const bookmarks = this.bookmarks();

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

    if (newBookmarkState) {
      this.actions
        .addResourceToBookmarks(bookmarksId, resource.id, resource.resourceType)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.isBookmarked.set(newBookmarkState);
          this.toastService.showSuccess('project.overview.dialog.toast.bookmark.add');
        });
    } else {
      this.actions
        .removeResourceFromBookmarks(bookmarksId, resource.id, resource.resourceType)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.isBookmarked.set(newBookmarkState);
          this.toastService.showSuccess('project.overview.dialog.toast.bookmark.remove');
        });
    }
  }
}
