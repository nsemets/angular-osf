import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';

import { filter, map, of, tap } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { SubHeaderComponent } from '@osf/shared/components';

import { CompareSectionComponent } from './components/compare-section/compare-section.component';
import { EditSectionComponent } from './components/edit-section/edit-section.component';
import { ViewSectionComponent } from './components/view-section/view-section.component';
import { WikiListComponent } from './components/wiki-list/wiki-list.component';
import { WikiSelectors } from './store/wiki.selectors';
import { WikiModes } from './models';
import {
  CreateWiki,
  DeleteWiki,
  GetComponentsWikiList,
  GetWikiContent,
  GetWikiList,
  GetWikiModes,
  SetCurrentWiki,
  ToggleMode,
  UpdateWikiContent,
} from './store';

const HomeWikiName = 'Home';

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
  ],
  templateUrl: './wiki.component.html',
  styleUrl: './wiki.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WikiComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  WikiModes = WikiModes;

  readonly projectId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));
  protected wikiModes = select(WikiSelectors.getWikiModes);
  protected currentContent = select(WikiSelectors.getCurrentContent);
  protected isWikiListLoading = select(WikiSelectors.getWikiListLoading || WikiSelectors.getComponentsWikiListLoading);
  protected wikiList = select(WikiSelectors.getWikiList);
  protected componentsWikiList = select(WikiSelectors.getComponentsWikiList);
  protected currentWikiId = select(WikiSelectors.getCurrentWikiId);

  protected actions = createDispatchMap({
    getWikiModes: GetWikiModes,
    toggleMode: ToggleMode,
    getWikiContent: GetWikiContent,
    getWikiList: GetWikiList,
    getComponentsWikiList: GetComponentsWikiList,
    updateWikiContent: UpdateWikiContent,
    setCurrentWiki: SetCurrentWiki,
    deleteWiki: DeleteWiki,
    createWiki: CreateWiki,
  });

  constructor() {
    this.actions.getWikiContent(this.projectId());
    this.actions
      .getWikiList(this.projectId())
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          if (!this.wikiList()?.length) {
            this.actions.createWiki(this.projectId(), HomeWikiName);
          }
        })
      )

      .subscribe();
    this.actions.getComponentsWikiList(this.projectId());
    this.route.queryParams
      .pipe(
        takeUntilDestroyed(),
        map((params) => params['wiki']),
        filter((wikiId) => wikiId),
        tap((wikiId) => this.actions.setCurrentWiki(wikiId))
      )
      .subscribe();
  }

  toggleMode(mode: WikiModes) {
    this.actions.toggleMode(mode);
  }

  updateWikiContent(content: string) {
    this.actions.updateWikiContent(content);
  }

  onDeleteWiki() {
    this.actions.deleteWiki(this.currentWikiId());
  }
}
