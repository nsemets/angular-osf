import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { PaginatorState } from 'primeng/paginator';

import { map, of } from 'rxjs';

import { DatePipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
  Signal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { ForkDialogComponent } from '@osf/features/project/overview/components/fork-dialog/fork-dialog.component';
import { ClearProjectOverview, GetProjectById, ProjectOverviewSelectors } from '@osf/features/project/overview/store';
import { ClearRegistry, GetRegistryById, RegistrySelectors } from '@osf/features/registry/store/registry';
import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { TruncatedTextComponent } from '@osf/shared/components/truncated-text/truncated-text.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { DeleteResourceService } from '@osf/shared/services/delete-resource.service';
import { ClearDuplicates, DuplicatesSelectors, GetAllDuplicates } from '@osf/shared/stores/duplicates';
import { BaseNodeModel } from '@shared/models/nodes/base-node.model';

@Component({
  selector: 'osf-view-duplicates',
  imports: [
    Button,
    Menu,
    RouterLink,
    IconComponent,
    SubHeaderComponent,
    TruncatedTextComponent,
    LoadingSpinnerComponent,
    CustomPaginatorComponent,
    ContributorsListComponent,
    DatePipe,
    TranslatePipe,
  ],
  templateUrl: './view-duplicates.component.html',
  styleUrl: './view-duplicates.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDuplicatesComponent {
  private readonly customDialogService = inject(CustomDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly deleteResourceService = inject(DeleteResourceService);

  private readonly actions = createDispatchMap({
    getProject: GetProjectById,
    getRegistration: GetRegistryById,
    getDuplicates: GetAllDuplicates,
    clearDuplicates: ClearDuplicates,
    clearProject: ClearProjectOverview,
    clearRegistration: ClearRegistry,
  });

  private readonly project = select(ProjectOverviewSelectors.getProject);
  private readonly registration = select(RegistrySelectors.getRegistry);

  readonly duplicates = select(DuplicatesSelectors.getDuplicates);
  readonly isDuplicatesLoading = select(DuplicatesSelectors.getDuplicatesLoading);
  readonly totalDuplicates = select(DuplicatesSelectors.getDuplicatesTotalCount);
  readonly isAuthenticated = select(UserSelectors.isAuthenticated);

  readonly pageSize = 10;

  readonly currentPage = signal<number>(1);
  readonly firstIndex = computed(() => (this.currentPage() - 1) * this.pageSize);

  readonly forkActionItems = (resourceId: string) => [
    {
      label: 'project.overview.actions.manageContributors',
      action: 'manageContributors',
      resourceId,
    },
    {
      label: 'project.overview.actions.settings',
      action: 'settings',
      resourceId,
    },
    {
      label: 'common.labels.delete',
      action: 'delete',
      resourceId,
    },
  ];

  readonly resourceId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));
  readonly resourceType: Signal<ResourceType | undefined> = toSignal(
    this.route.data.pipe(map((params) => params['resourceType'])) ?? of(undefined)
  );
  readonly currentResource = computed(() => {
    const resourceType = this.resourceType();

    if (resourceType) {
      if (resourceType === ResourceType.Project) return this.project();

      if (resourceType === ResourceType.Registration) return this.registration();
    }

    return null;
  });

  constructor() {
    effect(() => {
      const resourceId = this.resourceId();
      const resourceType = this.resourceType();

      if (resourceId) {
        if (resourceType === ResourceType.Project) this.actions.getProject(resourceId);
        if (resourceType === ResourceType.Registration) this.actions.getRegistration(resourceId);
      }
    });

    effect(() => {
      const resource = this.currentResource();

      if (resource) {
        this.actions.getDuplicates(resource.id, resource.type, this.currentPage(), this.pageSize);
      }
    });

    this.setupCleanup();
  }

  showMoreOptions(duplicate: BaseNodeModel) {
    return (
      duplicate.currentUserPermissions.includes(UserPermissions.Admin) ||
      duplicate.currentUserPermissions.includes(UserPermissions.Write)
    );
  }

  handleMenuAction(action: string, resourceId: string): void {
    switch (action) {
      case 'manageContributors':
        this.router.navigate([resourceId, 'contributors']);
        break;
      case 'settings':
        this.router.navigate([resourceId, 'settings']);
        break;
      case 'delete':
        this.handleDeleteFork(resourceId);
        break;
    }
  }

  handleForkResource(): void {
    const currentResource = this.currentResource();

    if (currentResource) {
      this.customDialogService
        .open(ForkDialogComponent, {
          header: 'project.overview.dialog.fork.headerProject',
          width: '450px',
          data: {
            resourceId: currentResource.id,
            resourceType: this.resourceType(),
          },
        })
        .onClose.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          if (result?.success) {
            this.actions.getDuplicates(currentResource.id, currentResource.type, this.currentPage(), this.pageSize);
          }
        });
    }
  }

  onPageChange(event: PaginatorState): void {
    if (event.page !== undefined) {
      const pageNumber = event.page + 1;
      this.currentPage.set(pageNumber);
    }
  }

  setupCleanup(): void {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser) {
        this.actions.clearDuplicates();
        this.actions.clearProject();
        this.actions.clearRegistration();
      }
    });
  }

  private handleDeleteFork(id: string): void {
    const resourceType = this.resourceType();
    if (!resourceType) return;

    this.deleteResourceService.deleteComponent({
      rootParentId: id,
      resourceId: id,
      resourceType,
      destroyRef: this.destroyRef,
      onSuccess: () => {
        const resource = this.currentResource();
        if (resource) {
          this.actions.getDuplicates(resource.id, resource.type, this.currentPage(), this.pageSize);
        }
      },
    });
  }
}
