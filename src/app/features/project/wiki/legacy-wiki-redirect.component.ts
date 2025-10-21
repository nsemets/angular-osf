// wiki-redirect.component.ts
import { createDispatchMap, select } from '@ngxs/store';

import { map, of, tap } from 'rxjs';

import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { ResourceType } from '@osf/shared/enums';
import { GetWikiList, WikiSelectors } from '@osf/shared/stores';

@Component({
  standalone: true,
  template: '',
})
export class WikiRedirectComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly projectId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));
  wikiList = select(WikiSelectors.getWikiList);

  actions = createDispatchMap({
    getWikiList: GetWikiList,
  });

  constructor() {
    const params = this.route.snapshot.params;
    const wikiName = params['wikiName'];

    this.actions
      .getWikiList(ResourceType.Project, this.projectId())
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          const wikiGUID = this.wikiList().find((item) => item.name === wikiName)?.id ?? null;
          this.router.navigate([`/${this.projectId()}/wiki`], {
            queryParams: { wiki: wikiGUID },
            replaceUrl: true,
          });
        })
      )
      .subscribe();
  }
}
