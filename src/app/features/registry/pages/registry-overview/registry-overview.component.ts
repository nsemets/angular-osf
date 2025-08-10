import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { DialogService } from 'primeng/dynamicdialog';

import { map, switchMap, tap } from 'rxjs';

import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { OverviewToolbarComponent } from '@osf/features/project/overview/components';
import { CreateSchemaResponse, FetchAllSchemaResponses } from '@osf/features/registries/store';
import {
  DataResourcesComponent,
  LoadingSpinnerComponent,
  RegistrationBlocksDataComponent,
  ResourceMetadataComponent,
  SubHeaderComponent,
} from '@osf/shared/components';
import { ResourceType, UserPermissions } from '@osf/shared/enums';
import { MapRegistryOverview } from '@osf/shared/mappers';
import { ToolbarResource } from '@osf/shared/models';
import { ToastService } from '@osf/shared/services';
import { GetBookmarksCollectionId } from '@shared/stores';

import { ArchivingMessageComponent, RegistryRevisionsComponent, RegistryStatusesComponent } from '../../components';
import { RegistryMakeDecisionComponent } from '../../components/registry-make-decision/registry-make-decision.component';
import { WithdrawnMessageComponent } from '../../components/withdrawn-message/withdrawn-message.component';
import {
  GetRegistryById,
  GetRegistryInstitutions,
  GetRegistryReviewActions,
  GetRegistrySubjects,
  RegistryOverviewSelectors,
  SetRegistryCustomCitation,
} from '../../store/registry-overview';

@Component({
  selector: 'osf-registry-overview',
  imports: [
    SubHeaderComponent,
    OverviewToolbarComponent,
    LoadingSpinnerComponent,
    RouterLink,
    ResourceMetadataComponent,
    RegistryRevisionsComponent,
    RegistryStatusesComponent,
    DataResourcesComponent,
    ArchivingMessageComponent,
    TranslatePipe,
    WithdrawnMessageComponent,
    RegistrationBlocksDataComponent,
  ],
  templateUrl: './registry-overview.component.html',
  styleUrl: './registry-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class RegistryOverviewComponent {
  @HostBinding('class') classes = 'flex-1 flex flex-column w-full h-full';
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly toastService = inject(ToastService);
  protected readonly dialogService = inject(DialogService);
  protected readonly translateService = inject(TranslateService);

  protected readonly registry = select(RegistryOverviewSelectors.getRegistry);
  protected readonly isRegistryLoading = select(RegistryOverviewSelectors.isRegistryLoading);
  protected readonly subjects = select(RegistryOverviewSelectors.getSubjects);
  protected readonly isSubjectsLoading = select(RegistryOverviewSelectors.isSubjectsLoading);
  protected readonly institutions = select(RegistryOverviewSelectors.getInstitutions);
  protected readonly isInstitutionsLoading = select(RegistryOverviewSelectors.isInstitutionsLoading);
  protected readonly schemaBlocks = select(RegistryOverviewSelectors.getSchemaBlocks);
  protected readonly isSchemaBlocksLoading = select(RegistryOverviewSelectors.isSchemaBlocksLoading);
  protected areReviewActionsLoading = select(RegistryOverviewSelectors.areReviewActionsLoading);

  protected readonly schemaResponse = computed(() => {
    const registry = this.registry();
    const index = this.selectedRevisionIndex();
    if (registry && index !== null) {
      return registry.schemaResponses[index];
    }
    return null;
  });

  protected readonly updatedFields = computed(() => {
    const schemaResponse = this.schemaResponse();
    if (schemaResponse) {
      return schemaResponse.updatedResponseKeys || [];
    }
    return [];
  });

  protected readonly resourceOverview = computed(() => {
    const registry = this.registry();
    const subjects = this.subjects();
    const institutions = this.institutions();
    if (registry && subjects && institutions) {
      return MapRegistryOverview(registry, subjects, institutions);
    }
    return null;
  });

  protected readonly selectedRevisionIndex = signal(0);

  protected toolbarResource = computed(() => {
    if (this.registry()) {
      return {
        id: this.registry()!.id,
        isPublic: this.registry()!.isPublic,
        storage: undefined,
        viewOnlyLinksCount: 0,
        forksCount: this.registry()!.forksCount,
        resourceType: ResourceType.Registration,
      } as ToolbarResource;
    }
    return null;
  });

  private readonly actions = createDispatchMap({
    getRegistryById: GetRegistryById,
    getBookmarksId: GetBookmarksCollectionId,
    getSubjects: GetRegistrySubjects,
    getInstitutions: GetRegistryInstitutions,
    setCustomCitation: SetRegistryCustomCitation,
    getRegistryReviewActions: GetRegistryReviewActions,
    getSchemaResponse: FetchAllSchemaResponses,
    createSchemaResponse: CreateSchemaResponse,
  });

  revisionId: string | null = null;
  isModeration = false;

  protected userPermissions = computed(() => {
    return this.registry()?.currentUserPermissions || [];
  });

  get isAdmin(): boolean {
    return this.userPermissions().includes(UserPermissions.Admin);
  }

  constructor() {
    this.route.parent?.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.actions.getRegistryById(id);
        this.actions.getSubjects(id);
        this.actions.getInstitutions(id);
      }
    });
    this.actions.getBookmarksId();
    this.route.queryParams
      .pipe(
        takeUntilDestroyed(),
        map((params) => ({ revisionId: params['revisionId'], mode: params['mode'] })),
        tap(({ revisionId, mode }) => {
          this.revisionId = revisionId;
          this.isModeration = mode === 'moderator';
        })
        // [NM] TODO: add logic to handle revisionId
        // switchMap((revisionId) => {
        // })
      )
      .subscribe();
  }

  navigateToFile(fileId: string): void {
    this.router.navigate(['/files', fileId]);
  }

  openRevision(revisionIndex: number): void {
    this.selectedRevisionIndex.set(revisionIndex);
  }

  onCustomCitationUpdated(citation: string): void {
    this.actions.setCustomCitation(citation);
  }

  onUpdateRegistration(id: string): void {
    this.actions
      .createSchemaResponse(id)
      .pipe(
        tap(() => {
          this.navigateToJustificationPage();
        })
      )
      .subscribe();
  }

  onContinueUpdateRegistration({ id, unapproved }: { id: string; unapproved: boolean }): void {
    this.actions
      .getSchemaResponse(id)
      .pipe(
        tap(() => {
          if (unapproved) {
            this.navigateToJustificationReview();
          } else {
            this.navigateToJustificationPage();
          }
        })
      )
      .subscribe();
  }

  private navigateToJustificationPage(): void {
    const revisionId = this.revisionId || this.schemaResponse()?.id;
    this.router.navigate([`/registries/revisions/${revisionId}/justification`]);
  }

  private navigateToJustificationReview(): void {
    const revisionId = this.revisionId || this.schemaResponse()?.id;
    this.router.navigate([`/registries/revisions/${revisionId}/review`]);
  }

  protected handleOpenMakeDecisionDialog() {
    const dialogWidth = '600px';
    this.actions
      .getRegistryReviewActions(this.registry()?.id || '')
      .pipe(
        switchMap(() =>
          this.dialogService
            .open(RegistryMakeDecisionComponent, {
              width: dialogWidth,
              focusOnShow: false,
              header: this.translateService.instant('moderation.makeDecision.header'),
              closeOnEscape: true,
              modal: true,
              closable: true,
              data: {
                registry: this.registry(),
                revisionId: this.revisionId,
              },
            })
            .onClose.pipe(takeUntilDestroyed(this.destroyRef))
        )
      )
      .subscribe((data) => {
        if (data) {
          if (data.action) {
            this.toastService.showSuccess(`moderation.makeDecision.${data.action}Success`);
          }
          const currentUrl = this.router.url.split('?')[0];
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
          });
          this.actions.getRegistryById(this.registry()?.id || '');
        }
      });
  }
}
