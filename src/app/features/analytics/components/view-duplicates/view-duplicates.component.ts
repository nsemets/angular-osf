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
import { ForkDialogComponent } from '@osf/features/project/overview/components/fork-dialog/fork-dialog.component';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { LoaderService } from '@osf/shared/services/loader.service';
import { GetResourceWithChildren } from '@osf/shared/stores/current-resource';
import { ClearDuplicates, DuplicatesSelectors, GetAllDuplicates } from '@osf/shared/stores/duplicates';

import { RELATED_NODE_MENU_ITEMS } from '../../constants/related-node-menu-items.const';
import { RelatedNodeMenuAction } from '../../enums/related-node-menu-action.enum';
import { RelatedNodeCardComponent } from '../related-node-card/related-node-card.component';

@Component({
  selector: 'osf-view-duplicates',
  imports: [
    SubHeaderComponent,
    LoadingSpinnerComponent,
    CustomPaginatorComponent,
    RelatedNodeCardComponent,
    TranslatePipe,
  ],
  templateUrl: './view-duplicates.component.html',
  styleUrl: './view-duplicates.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDuplicatesComponent {
  private readonly customDialogService = inject(CustomDialogService);
  private readonly loaderService = inject(LoaderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly duplicates = select(DuplicatesSelectors.getDuplicates);
  readonly isDuplicatesLoading = select(DuplicatesSelectors.getDuplicatesLoading);
  readonly totalDuplicates = select(DuplicatesSelectors.getDuplicatesTotalCount);
  readonly isAuthenticated = select(UserSelectors.isAuthenticated);

  readonly pageSize = 10;

  readonly currentPage = signal<number>(1);
  readonly firstIndex = computed(() => (this.currentPage() - 1) * this.pageSize);

  readonly forkActionItems = RELATED_NODE_MENU_ITEMS;

  readonly resourceId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));

  readonly resourceType: Signal<ResourceType | undefined> = toSignal(
    this.route.data.pipe(map((params) => params['resourceType'])) ?? of(undefined)
  );

  private readonly actions = createDispatchMap({
    getDuplicates: GetAllDuplicates,
    clearDuplicates: ClearDuplicates,
    getComponentsTree: GetResourceWithChildren,
  });

  constructor() {
    this.initDuplicatesEffect();
    this.setupCleanup();
  }

  handleMenuAction(action: RelatedNodeMenuAction, resourceId: string): void {
    switch (action) {
      case RelatedNodeMenuAction.ManageContributors:
        this.router.navigate([resourceId, 'contributors']);
        break;
      case RelatedNodeMenuAction.Settings:
        this.router.navigate([resourceId, 'settings']);
        break;
      case RelatedNodeMenuAction.Delete:
        this.handleDeleteFork(resourceId);
        break;
    }
  }

  handleForkResource(): void {
    const resourceId = this.resourceId();
    const resourceType = this.resourceType();

    if (!resourceId || !resourceType) {
      return;
    }

    this.customDialogService
      .open(ForkDialogComponent, {
        header: 'project.overview.dialog.fork.headerProject',
        width: '450px',
        data: { resourceId, resourceType },
      })
      .onClose.pipe(
        filter((result) => !!result.success),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.actions.getDuplicates(resourceId, resourceType, this.currentPage(), this.pageSize);
      });
  }

  onPageChange(event: PaginatorState): void {
    if (event.page !== undefined) {
      const pageNumber = event.page + 1;
      this.currentPage.set(pageNumber);
    }
  }

  private initDuplicatesEffect(): void {
    effect(() => {
      const resourceId = this.resourceId();
      const resourceType = this.resourceType();

      if (resourceId && resourceType) {
        this.actions.getDuplicates(resourceId, resourceType, this.currentPage(), this.pageSize);
      }
    });
  }

  private setupCleanup(): void {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser) {
        this.actions.clearDuplicates();
      }
    });
  }

  private handleDeleteFork(id: string): void {
    const resourceId = this.resourceId();
    const resourceType = this.resourceType();

    if (!resourceId || !resourceType) {
      return;
    }

    this.loaderService.show();

    this.actions.getComponentsTree(id, id, resourceType).subscribe({
      next: () => {
        this.loaderService.hide();
        this.customDialogService
          .open(DeleteComponentDialogComponent, {
            header: 'project.overview.dialog.deleteComponent.header',
            width: '650px',
            data: {
              componentId: id,
              resourceType: resourceType,
              isForksContext: true,
              currentPage: this.currentPage(),
              pageSize: this.pageSize,
            },
          })
          .onClose.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((result) => {
            if (result?.success) {
              this.actions.getDuplicates(resourceId, resourceType, this.currentPage(), this.pageSize);
            }
          });
      },
      error: () => {
        this.loaderService.hide();
      },
    });
  }
}
