import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';

import { filter, map, mergeMap, of, tap } from 'rxjs';

import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { CompareSectionComponent } from '@osf/shared/components/wiki/compare-section/compare-section.component';
import { EditSectionComponent } from '@osf/shared/components/wiki/edit-section/edit-section.component';
import { ViewSectionComponent } from '@osf/shared/components/wiki/view-section/view-section.component';
import { WikiListComponent } from '@osf/shared/components/wiki/wiki-list/wiki-list.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { hasViewOnlyParam } from '@osf/shared/helpers/view-only.helper';
import { WikiModes } from '@osf/shared/models';
import { ToastService } from '@osf/shared/services/toast.service';
import { CurrentResourceSelectors } from '@osf/shared/stores/current-resource';
import {
  ClearWiki,
  CreateWiki,
  CreateWikiVersion,
  DeleteWiki,
  GetCompareVersionContent,
  GetComponentsWikiList,
  GetWikiContent,
  GetWikiList,
  GetWikiModes,
  GetWikiVersionContent,
  GetWikiVersions,
  SetCurrentWiki,
  ToggleMode,
  UpdateWikiPreviewContent,
  WikiSelectors,
} from '@osf/shared/stores/wiki';
import { ViewOnlyLinkMessageComponent } from '@shared/components/view-only-link-message/view-only-link-message.component';

@Component({
  selector: 'osf-wiki',
  imports: [
    SubHeaderComponent,
    TranslatePipe,
    ButtonGroupModule,
    Button,
    WikiListComponent,
    ViewSectionComponent,
    EditSectionComponent,
    CompareSectionComponent,
    ViewOnlyLinkMessageComponent,
  ],
  templateUrl: './wiki.component.html',
  styleUrl: './wiki.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WikiComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);

  WikiModes = WikiModes;
  homeWikiName = 'Home';

  readonly projectId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));
  wikiModes = select(WikiSelectors.getWikiModes);
  previewContent = select(WikiSelectors.getPreviewContent);
  versionContent = select(WikiSelectors.getWikiVersionContent);
  compareVersionContent = select(WikiSelectors.getCompareVersionContent);
  isWikiListLoading = select(WikiSelectors.getWikiListLoading || WikiSelectors.getComponentsWikiListLoading);
  wikiList = select(WikiSelectors.getWikiList);
  componentsWikiList = select(WikiSelectors.getComponentsWikiList);
  currentWikiId = select(WikiSelectors.getCurrentWikiId);
  wikiVersions = select(WikiSelectors.getWikiVersions);
  isWikiVersionSubmitting = select(WikiSelectors.getWikiVersionSubmitting);
  isWikiVersionLoading = select(WikiSelectors.getWikiVersionsLoading);
  isCompareVersionLoading = select(WikiSelectors.getCompareVersionsLoading);
  isAnonymous = select(WikiSelectors.isWikiAnonymous);
  hasViewOnly = computed(() => hasViewOnlyParam(this.router));

  hasWriteAccess = select(CurrentResourceSelectors.hasWriteAccess);
  hasAdminAccess = select(CurrentResourceSelectors.hasAdminAccess);

  actions = createDispatchMap({
    getWikiModes: GetWikiModes,
    toggleMode: ToggleMode,
    getWikiContent: GetWikiContent,
    getWikiList: GetWikiList,
    getComponentsWikiList: GetComponentsWikiList,
    updateWikiPreviewContent: UpdateWikiPreviewContent,
    setCurrentWiki: SetCurrentWiki,
    deleteWiki: DeleteWiki,
    createWiki: CreateWiki,
    getWikiVersions: GetWikiVersions,
    createWikiVersion: CreateWikiVersion,
    getWikiVersionContent: GetWikiVersionContent,
    getCompareVersionContent: GetCompareVersionContent,
    clearWiki: ClearWiki,
  });

  wikiIdFromQueryParams = this.route.snapshot.queryParams['wiki'];

  constructor() {
    this.actions
      .getWikiList(ResourceType.Project, this.projectId())
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          if (!this.wikiIdFromQueryParams) {
            this.navigateToWiki(this.wikiList()?.[0]?.id || '');
          }
          if (!this.wikiList()?.length && this.hasWriteAccess()) {
            this.actions.createWiki(ResourceType.Project, this.projectId(), this.homeWikiName);
          }
        })
      )
      .subscribe();

    this.actions.getComponentsWikiList(ResourceType.Project, this.projectId());

    this.route.queryParams
      .pipe(
        takeUntilDestroyed(),
        map((params) => params['wiki']),
        filter((wikiId) => wikiId),
        tap((wikiId) => {
          this.actions.setCurrentWiki(wikiId);
        }),
        mergeMap((wikiId) => this.actions.getWikiVersions(wikiId))
      )
      .subscribe();

    this.destroyRef.onDestroy(() => {
      this.actions.clearWiki();
    });
  }

  toggleMode(mode: WikiModes) {
    this.actions.toggleMode(mode);
  }

  updateWikiPreviewContent(content: string) {
    this.actions.updateWikiPreviewContent(content);
  }

  onCreateWiki() {
    this.navigateToWiki(this.currentWikiId());
  }

  onDeleteWiki() {
    this.actions.deleteWiki(this.currentWikiId()).pipe(tap(() => this.navigateToWiki(this.currentWikiId())));
  }

  onSaveContent(content: string) {
    this.actions
      .createWikiVersion(this.currentWikiId(), content)
      .pipe(
        tap(() => {
          this.toastService.showSuccess('project.wiki.version.successSaved');
          this.actions.getWikiVersions(this.currentWikiId());
        })
      )
      .subscribe();
  }

  onSelectVersion(versionId: string) {
    this.actions.getWikiVersionContent(this.currentWikiId(), versionId);
  }

  onSelectCompareVersion(versionId: string) {
    this.actions.getCompareVersionContent(this.currentWikiId(), versionId);
  }

  private navigateToWiki(wiki: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { wiki },
      queryParamsHandling: 'merge',
    });
  }
}
