import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { PaginatorState } from 'primeng/paginator';

import { filter, map, of } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
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
import { ActivatedRoute, Router } from '@angular/router';

import { UserSelectors } from '@core/store/user';
import { DeleteComponentDialogComponent } from '@osf/features/project/overview/components/delete-component-dialog/delete-component-dialog.component';
import { ForkProject } from '@osf/features/project/overview/store';
import { ForkRegistry } from '@osf/features/registry/store/registry';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { CurrentResourceType, ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ForkDialogService } from '@osf/shared/services/fork-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { GetResourceWithChildren } from '@osf/shared/stores/current-resource';
import { ClearDuplicates, DuplicatesSelectors, GetAllDuplicates } from '@osf/shared/stores/duplicates';

import { DuplicateMenuAction } from '../../enums/duplicate-menu-action.enum';
import { DuplicateCardComponent } from '../duplicate-card/duplicate-card.component';

@Component({
  selector: 'osf-view-duplicates',
  imports: [
    SubHeaderComponent,
    LoadingSpinnerComponent,
    CustomPaginatorComponent,
    DuplicateCardComponent,
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

  readonly duplicates = select(DuplicatesSelectors.getDuplicates);
  readonly isDuplicatesLoading = select(DuplicatesSelectors.getDuplicatesLoading);
  readonly totalDuplicates = select(DuplicatesSelectors.getDuplicatesTotalCount);
  readonly isAuthenticated = select(UserSelectors.isAuthenticated);
  readonly preventDuplicateCreation = select(UserSelectors.isProjectCreationDisabled);

  readonly actions = createDispatchMap({
    getDuplicates: GetAllDuplicates,
    clearDuplicates: ClearDuplicates,
    getComponentsTree: GetResourceWithChildren,
    forkProject: ForkProject,
    forkRegistry: ForkRegistry,
  });

  readonly pageSize = 10;

  currentPage = signal<number>(1);
  readonly firstIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly duplicateButtonLabel = computed(() =>
    this.resourceType() === ResourceType.Registration
      ? 'project.overview.actions.duplicateRegistration'
      : 'project.overview.actions.forkProjectLabel'
  );
  readonly duplicateButtonTooltip = computed(() =>
    this.preventDuplicateCreation() ? 'project.overview.actions.duplicatingProjectsNotAllowed' : ''
  );

  readonly resourceId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));
  readonly resourceType: Signal<ResourceType | undefined> = toSignal(
    this.route.data.pipe(map((params) => params['resourceType'])) ?? of(undefined)
  );
  readonly apiResourceType = computed(() =>
    this.resourceType() === ResourceType.Registration ? CurrentResourceType.Registrations : CurrentResourceType.Projects
  );

  constructor() {
    effect(() => {
      const id = this.resourceId();
      const type = this.apiResourceType();
      const page = this.currentPage();

      if (!id || !type) return;

      this.actions.getDuplicates(id, type, page, this.pageSize);
    });

    this.setupCleanup();
  }

  handleMenuAction(action: DuplicateMenuAction, resourceId: string): void {
    switch (action) {
      case DuplicateMenuAction.ManageContributors:
        this.router.navigate([resourceId, 'contributors']);
        break;
      case DuplicateMenuAction.Settings:
        this.router.navigate([resourceId, 'settings']);
        break;
      case DuplicateMenuAction.Delete:
        this.handleDeleteFork(resourceId);
        break;
    }
  }

  handleFork(): void {
    const resourceId = this.resourceId();
    const apiResourceType = this.apiResourceType();

    if (!resourceId) return;

    const isRegistration = apiResourceType === CurrentResourceType.Registrations;

    this.forkDialogService.confirmFork({
      resourceType: apiResourceType,
      destroyRef: this.destroyRef,
      fork: () => (isRegistration ? this.actions.forkRegistry(resourceId) : this.actions.forkProject(resourceId)),
      onSuccess: () => this.actions.getDuplicates(resourceId, apiResourceType, this.currentPage(), this.pageSize),
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
            filter((result) => !!result?.success),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => {
            const resourceId = this.resourceId();
            const apiResourceType = this.apiResourceType();
            if (resourceId && apiResourceType) {
              this.actions.getDuplicates(resourceId, apiResourceType, this.currentPage(), this.pageSize);
            }
          });
      },
      error: () => {
        this.loaderService.hide();
      },
    });
  }
}
