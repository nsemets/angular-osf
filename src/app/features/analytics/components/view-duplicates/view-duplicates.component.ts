import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { PaginatorState } from 'primeng/paginator';

import { filter, map, of } from 'rxjs';

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
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { DeleteComponentDialogComponent } from '@osf/features/project/overview/components/delete-component-dialog/delete-component-dialog.component';
import {
  ClearProjectOverview,
  ForkProject,
  GetProjectById,
  ProjectOverviewSelectors,
} from '@osf/features/project/overview/store';
import { ClearRegistry, ForkRegistry, GetRegistryById, RegistrySelectors } from '@osf/features/registry/store/registry';
import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { TruncatedTextComponent } from '@osf/shared/components/truncated-text/truncated-text.component';
import { CurrentResourceType, ResourceType } from '@osf/shared/enums/resource-type.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ForkDialogService } from '@osf/shared/services/fork-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { GetResourceWithChildren } from '@osf/shared/stores/current-resource';
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
  private readonly forkDialogService = inject(ForkDialogService);
  private readonly loaderService = inject(LoaderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly project = select(ProjectOverviewSelectors.getProject);
  private readonly registration = select(RegistrySelectors.getRegistry);

  readonly duplicates = select(DuplicatesSelectors.getDuplicates);
  readonly isDuplicatesLoading = select(DuplicatesSelectors.getDuplicatesLoading);
  readonly totalDuplicates = select(DuplicatesSelectors.getDuplicatesTotalCount);
  readonly isAuthenticated = select(UserSelectors.isAuthenticated);
  readonly preventDuplicateCreation = select(UserSelectors.isProjectCreationDisabled);

  readonly actions = createDispatchMap({
    getProject: GetProjectById,
    getRegistration: GetRegistryById,
    getDuplicates: GetAllDuplicates,
    clearDuplicates: ClearDuplicates,
    clearProject: ClearProjectOverview,
    clearRegistration: ClearRegistry,
    getComponentsTree: GetResourceWithChildren,
    forkProject: ForkProject,
    forkRegistry: ForkRegistry,
  });

  readonly pageSize = 10;

  currentPage = signal<number>(1);
  firstIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  duplicateButtonLabel = computed(() =>
    this.resourceType() === ResourceType.Registration
      ? 'project.overview.actions.duplicateRegistration'
      : 'project.overview.actions.forkProjectLabel'
  );
  duplicateButtonTooltip = computed(() =>
    this.preventDuplicateCreation() ? 'project.overview.actions.duplicatingProjectsNotAllowed' : ''
  );

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
    switch (this.resourceType()) {
      case ResourceType.Project:
        return this.project();
      case ResourceType.Registration:
        return this.registration();
      default:
        return null;
    }
  });

  constructor() {
    effect(() => {
      const id = this.resourceId();
      const type = this.resourceType();

      if (!id) return;

      untracked(() => {
        switch (type) {
          case ResourceType.Project:
            this.actions.getProject(id);
            break;
          case ResourceType.Registration:
            this.actions.getRegistration(id);
            break;
        }
      });
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

  handleFork(): void {
    const currentResource = this.currentResource();
    const resourceType = this.resourceType();

    if (!currentResource || !resourceType) return;

    const isRegistration = resourceType === ResourceType.Registration;
    const currentResourceType = isRegistration ? CurrentResourceType.Registrations : CurrentResourceType.Projects;

    this.forkDialogService.confirmFork({
      resourceType: currentResourceType,
      destroyRef: this.destroyRef,
      fork: () =>
        isRegistration ? this.actions.forkRegistry(currentResource.id) : this.actions.forkProject(currentResource.id),
      onSuccess: () =>
        this.actions.getDuplicates(currentResource.id, currentResource.type, this.currentPage(), this.pageSize),
    });
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
    this.loaderService.show();

    this.actions.getComponentsTree(id, id, ResourceType.Project).subscribe({
      next: () => {
        this.loaderService.hide();
        this.customDialogService
          .open(DeleteComponentDialogComponent, {
            header: 'project.overview.dialog.deleteComponent.header',
            width: '650px',
            data: { isForksContext: true },
          })
          .onClose.pipe(
            filter((result) => !!result.success),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => {
            const resource = this.currentResource();
            if (resource) {
              this.actions.getDuplicates(resource.id, resource.type, this.currentPage(), this.pageSize);
            }
          });
      },
      error: () => {
        this.loaderService.hide();
      },
    });
  }
}
