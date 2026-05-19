import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { PaginatorState } from 'primeng/paginator';

import { map, of } from 'rxjs';

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
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { CurrentResourceType, ResourceType } from '@osf/shared/enums/resource-type.enum';
import { ClearLinkedProjects, GetAllLinkedProjects, LinkedProjectsSelectors } from '@shared/stores/linked-projects';

import { RelatedNodeCardComponent } from '../related-node-card/related-node-card.component';

@Component({
  selector: 'osf-view-linked-nodes',
  imports: [
    SubHeaderComponent,
    TranslatePipe,
    LoadingSpinnerComponent,
    CustomPaginatorComponent,
    RelatedNodeCardComponent,
  ],
  templateUrl: './view-linked-projects.component.html',
  styleUrl: './view-linked-projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewLinkedProjectsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly linkedProjects = select(LinkedProjectsSelectors.getLinkedProjects);
  readonly isLoading = select(LinkedProjectsSelectors.getLinkedProjectsLoading);
  readonly totalLinkedProjects = select(LinkedProjectsSelectors.getLinkedProjectsTotalCount);

  private readonly actions = createDispatchMap({
    getLinkedProjects: GetAllLinkedProjects,
    clearLinkedProjects: ClearLinkedProjects,
  });

  readonly pageSize = 10;
  readonly currentPage = signal<number>(1);
  readonly firstIndex = computed(() => (this.currentPage() - 1) * this.pageSize);

  readonly resourceId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));
  readonly resourceType: Signal<CurrentResourceType | undefined> = toSignal(
    this.route.data.pipe(
      map((params) =>
        params['resourceType'] === ResourceType.Registration
          ? CurrentResourceType.Registrations
          : CurrentResourceType.Projects
      )
    ) ?? of(undefined)
  );

  constructor() {
    this.initLinkedProjectsEffect();
    this.setupCleanup();
  }

  onPageChange(event: PaginatorState): void {
    if (event.page !== undefined) {
      const pageNumber = event.page + 1;
      this.currentPage.set(pageNumber);
    }
  }

  private initLinkedProjectsEffect(): void {
    effect(() => {
      const resourceId = this.resourceId();
      const resourceType = this.resourceType();

      if (resourceId && resourceType) {
        this.actions.getLinkedProjects(resourceId, resourceType, this.currentPage(), this.pageSize);
      }
    });
  }

  private setupCleanup(): void {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser) {
        this.actions.clearLinkedProjects();
      }
    });
  }
}
