import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { StopPropagationDirective } from '@osf/shared/directives/stop-propagation.directive';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@shared/models/files/file.model';
import { FileMenuAction, FileMenuFlags } from '@shared/models/files/file-menu-action.model';

import { FileSizePipe } from '../../pipes/file-size.pipe';
import { FileMenuComponent } from '../file-menu/file-menu.component';

@Component({
  selector: 'osf-files-tree-row',
  imports: [Button, DatePipe, FileSizePipe, TranslatePipe, FileMenuComponent, StopPropagationDirective],
  templateUrl: './files-tree-row.component.html',
  styleUrl: './files-tree-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesTreeRowComponent {
  file = input.required<FileModel>();
  hasFoldersStack = input<boolean>(false);
  showMenu = input<boolean>(false);
  allowedMenuActions = input.required<FileMenuFlags>();

  openParentFolder = output<void>();
  openEntry = output<FileModel>();
  menuAction = output<FileMenuAction>();

  readonly isFolder = computed(() => this.file().kind === FileKind.Folder);

  readonly downloadsCount = computed(() => {
    if (!this.file().extra.downloads || this.isFolder()) {
      return '';
    }
    return this.file().extra.downloads;
  });

  onOpenEntry(): void {
    this.openEntry.emit(this.file());
  }
}
