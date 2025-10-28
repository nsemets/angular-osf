import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';

import { timer } from 'rxjs';

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { ClearDuplicatedProject, ProjectOverviewSelectors } from '@osf/features/project/overview/store';
import { SocialsShareButtonComponent } from '@osf/shared/components/socials-share-button/socials-share-button.component';
import { ResourceType } from '@osf/shared/enums';
import { ToolbarResource } from '@osf/shared/models';
import { FileSizePipe } from '@osf/shared/pipes';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { AddResourceToBookmarks, BookmarksSelectors, RemoveResourceFromBookmarks } from '@osf/shared/stores/bookmarks';
import { GetMyBookmarks, MyResourcesSelectors } from '@osf/shared/stores/my-resources';
import { hasViewOnlyParam } from '@shared/helpers';

import { DuplicateDialogComponent } from '../duplicate-dialog/duplicate-dialog.component';
import { ForkDialogComponent } from '../fork-dialog/fork-dialog.component';
import { TogglePublicityDialogComponent } from '../toggle-publicity-dialog/toggle-publicity-dialog.component';

@Component({
  selector: 'osf-overview-toolbar',
  imports: [
    ToggleSwitch,
    TranslatePipe,
    Menu,
    Button,
    Tooltip,
    FormsModule,
    NgClass,
    RouterLink,
    FileSizePipe,
    SocialsShareButtonComponent,
  ],
  templateUrl: './overview-toolbar.component.html',
  styleUrl: './overview-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewToolbarComponent {
  private store = inject(Store);
  private customDialogService = inject(CustomDialogService);
  private toastService = inject(ToastService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  destroyRef = inject(DestroyRef);
  isPublic = signal(false);
  isBookmarked = signal(false);

  isCollectionsRoute = input<boolean>(false);
  canEdit = input.required<boolean>();
  currentResource = input.required<ToolbarResource>();
  projectDescription = input<string>('');
  showViewOnlyLinks = input<boolean>(true);

  isBookmarksLoading = select(MyResourcesSelectors.getBookmarksLoading);
  isBookmarksSubmitting = select(BookmarksSelectors.getBookmarksCollectionIdSubmitting);
  bookmarksCollectionId = select(BookmarksSelectors.getBookmarksCollectionId);
  bookmarkedProjects = select(MyResourcesSelectors.getBookmarks);
  duplicatedProject = select(ProjectOverviewSelectors.getDuplicatedProject);
  isAuthenticated = select(UserSelectors.isAuthenticated);

  hasViewOnly = computed(() => hasViewOnlyParam(this.router));

  actions = createDispatchMap({ clearDuplicatedProject: ClearDuplicatedProject });

  readonly ResourceType = ResourceType;

  readonly forkActionItems = [
    {
      label: 'project.overview.actions.forkProject',
      command: () => this.handleForkResource(),
    },
    {
      label: 'project.overview.actions.duplicateProject',
      command: () => this.handleDuplicateProject(),
    },
    {
      label: 'project.overview.actions.viewDuplication',
      command: () => {
        this.router.navigate(['../analytics/duplicates'], { relativeTo: this.route });
      },
    },
  ];

  get isRegistration(): boolean {
    return this.currentResource()?.resourceType === ResourceType.Registration;
  }

  constructor() {
    effect(() => {
      const bookmarksId = this.bookmarksCollectionId();
      const resource = this.currentResource();

      if (!bookmarksId || !resource) {
        return;
      }

      this.store.dispatch(new GetMyBookmarks(bookmarksId, 1, 100, {}, resource.resourceType));
    });

    effect(() => {
      const resource = this.currentResource();
      if (resource) {
        this.isPublic.set(resource.isPublic);
      }
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

  handleToggleProjectPublicity(): void {
    const resource = this.currentResource();
    if (!resource) return;

    const isCurrentlyPublic = resource.isPublic;

    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.isPublic.set(resource.isPublic));

    this.customDialogService.open(TogglePublicityDialogComponent, {
      header: isCurrentlyPublic
        ? 'project.overview.dialog.makePrivate.header'
        : 'project.overview.dialog.makePublic.header',
      width: '600px',
      data: {
        projectId: resource.id,
        isCurrentlyPublic,
      },
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

  private handleForkResource(): void {
    const resource = this.currentResource();
    const headerTranslation =
      resource?.resourceType === ResourceType.Project
        ? 'project.overview.dialog.fork.headerProject'
        : resource?.resourceType === ResourceType.Registration
          ? 'project.overview.dialog.fork.headerRegistry'
          : '';

    if (resource) {
      this.customDialogService.open(ForkDialogComponent, {
        header: headerTranslation,
        data: {
          resource: resource,
        },
      });
    }
  }

  private handleDuplicateProject(): void {
    this.customDialogService
      .open(DuplicateDialogComponent, { header: 'project.overview.dialog.duplicate.header' })
      .onClose.subscribe({
        next: () => {
          const duplicatedProject = this.duplicatedProject();

          if (duplicatedProject) {
            this.router.navigate(['/', duplicatedProject.id]);
          }
        },
        complete: () => this.actions.clearDuplicatedProject(),
      });
  }
}
