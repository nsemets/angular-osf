import { TranslateService } from '@ngx-translate/core';

import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { Skeleton } from 'primeng/skeleton';

import { ChangeDetectionStrategy, Component, computed, inject, input, Signal, signal } from '@angular/core';

import { Wiki } from '../../models';
import { ComponentWiki } from '../../store';
import { AddWikiDialogComponent } from '../add-wiki-dialog/add-wiki-dialog.component';

enum WikiItemType {
  Folder = 'folder',
  File = 'file',
  Component = 'component',
}
interface WikiMenuItem extends MenuItem {
  type?: WikiItemType;
  items?: WikiMenuItem[];
}

@Component({
  selector: 'osf-wiki-list',
  imports: [PanelModule, Button, PanelMenuModule, ButtonGroupModule, Skeleton],
  templateUrl: './wiki-list.component.html',
  styleUrl: './wiki-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class WikiListComponent {
  readonly projectId = input.required<string>();
  readonly list = input<Wiki[]>();
  readonly isLoading = input<boolean>(false);
  readonly componentsList = input<ComponentWiki[]>();
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);
  wikiItemType = WikiItemType;
  expanded = signal(true);

  projectWikis: WikiMenuItem[] = [
    {
      label: 'Project Wiki Pages',
      expanded: true,
      type: WikiItemType.Folder,
    },
  ];
  componentsWikis: WikiMenuItem[] = [
    {
      label: 'Components Wiki Pages',
      type: WikiItemType.Folder,
    },
  ];

  wikiMenu: Signal<WikiMenuItem[]> = computed(() => {
    return [
      ...this.projectWikis.map((item) => ({
        ...item,
        items: this.list()?.map((wiki) => ({
          id: wiki.id,
          label: wiki.name,
          type: WikiItemType.File,
        })),
      })),
      ...this.componentsWikis.map((item) => ({
        ...item,
        items: this.componentsList()?.map((component) => ({
          id: component.id,
          label: component.title,
          type: WikiItemType.Component,
          items: component.list.map((wiki) => ({
            id: wiki.id,
            label: wiki.name,
            type: WikiItemType.File,
          })),
        })),
      })),
    ];
  });

  constructor() {
    console.log('WikiListComponent initialized with wikis:', this.wikiMenu());
  }

  openAddWikiDialog() {
    const dialogRef = this.#dialogService.open(AddWikiDialogComponent, {
      header: this.#translateService.instant('project.wiki.addNewWiki'),
      data: {
        projectId: this.projectId(),
      },
    });
    dialogRef.onClose.subscribe((result) => {
      console.log('Dialog closed with result:', result);
      if (result) {
        // Handle the result from the dialog if needed
        console.log('New wiki added:', result);
      }
    });
  }

  collapseNavigation() {
    this.expanded.update((value) => !value);
  }
}
