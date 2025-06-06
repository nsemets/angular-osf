import { TranslateService } from '@ngx-translate/core';

import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { DialogService } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { AddWikiDialogComponent } from '../add-wiki-dialog/add-wiki-dialog.component';

@Component({
  selector: 'osf-wiki-list',
  imports: [PanelModule, Button, PanelMenuModule, ButtonGroupModule],
  templateUrl: './wiki-list.component.html',
  styleUrl: './wiki-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class WikiListComponent implements OnInit {
  expanded = signal(false);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);

  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Project Wiki Pages',
        icon: 'pi pi-file',
        expanded: true,
        items: [
          {
            label: 'Wiki 1',
            icon: 'pi pi-file',
          },
          {
            label: 'Wiki 2',
            icon: 'pi pi-file',
          },
        ],
      },
      {
        label: 'Component Wiki Pages',
        icon: 'pi pi-cloud',
        items: [
          {
            label: 'Test Component 1',
            icon: 'pi pi-cloud-upload',
            items: [
              {
                label: 'Test Sub Component 1',
                icon: 'pi pi-cloud-upload',
              },
              {
                label: 'Test Sub Component 2',
                icon: 'pi pi-cloud-upload',
              },
            ],
          },
          {
            label: 'Test Component 2',
            icon: 'pi pi-cloud-download',
            items: [
              {
                label: 'Test Sub Component 1',
                icon: 'pi pi-cloud-download',
              },
            ],
          },
        ],
      },
    ];
  }

  openAddWikiDialog() {
    this.#dialogService.open(AddWikiDialogComponent, {
      header: this.#translateService.instant('project.wiki.addNewWiki'),
    });
  }

  collapseNavigation() {
    this.expanded.update((value) => !value);
  }
}
