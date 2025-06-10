import { TranslateService } from '@ngx-translate/core';

import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';

import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';

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
  imports: [PanelModule, Button, PanelMenuModule, ButtonGroupModule],
  templateUrl: './wiki-list.component.html',
  styleUrl: './wiki-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class WikiListComponent implements OnInit {
  list = input<Wiki[]>();
  componentsList = input<ComponentWiki[]>();
  expanded = signal(true);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);
  wikiItemType = WikiItemType;

  items: WikiMenuItem[] = [];

  ngOnInit() {
    console.log('WikiListComponent ngOnInit');

    setTimeout(() => {
      console.log('list', this.list());
      console.log('componentsList', this.componentsList());
    }, 4000);

    this.items = [
      {
        label: 'Project Wiki Pages',
        icon: 'fas fa-folder-open',
        expanded: true,
        type: WikiItemType.Folder,
        items: [
          {
            label: 'Wiki 1',
            icon: 'pi pi-file',
            type: WikiItemType.File,
            queryParams: { mode: 'view', wikiId: 'wiki1' },
          },
          {
            label: 'Wiki 2',
            icon: 'pi pi-file',
            type: WikiItemType.File,
          },
        ],
      },
      {
        label: 'Component Wiki Pages',
        icon: 'fas fa-folder',
        type: WikiItemType.Folder,
        items: [
          {
            label: 'Test Component 1',
            icon: 'pi pi-cloud-upload',
            type: WikiItemType.Component,
            items: [
              {
                label: 'Test Sub Component 1',
                icon: 'pi pi-cloud-upload',
                type: WikiItemType.File,
              },
            ],
          },
        ],
      },
    ];
  }

  openAddWikiDialog() {
    const dialogRef = this.#dialogService.open(AddWikiDialogComponent, {
      header: this.#translateService.instant('project.wiki.addNewWiki'),
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
