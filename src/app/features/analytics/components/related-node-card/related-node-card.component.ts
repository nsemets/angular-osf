import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { TruncatedTextComponent } from '@osf/shared/components/truncated-text/truncated-text.component';
import { NodeModel } from '@osf/shared/models/nodes/base-node.model';

import { RelatedNodeMenuAction } from '../../enums/related-node-menu-action.enum';
import { RelatedNodeMenuItem } from '../../models/related-node-menu-item.model';

@Component({
  selector: 'osf-related-node-card',
  imports: [
    Button,
    Menu,
    RouterLink,
    IconComponent,
    TruncatedTextComponent,
    ContributorsListComponent,
    DatePipe,
    TranslatePipe,
  ],
  templateUrl: './related-node-card.component.html',
  styleUrl: './related-node-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedNodeCardComponent {
  readonly node = input.required<NodeModel>();
  readonly menuItems = input<RelatedNodeMenuItem[]>();

  readonly menuAction = output<RelatedNodeMenuAction>();

  readonly dateFormat = 'MMM d, y, h:mm a';

  onMenuAction(action: RelatedNodeMenuAction): void {
    this.menuAction.emit(action);
  }
}
