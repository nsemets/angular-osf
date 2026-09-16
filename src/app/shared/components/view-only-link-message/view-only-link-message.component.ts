import { TranslatePipe } from '@ngx-translate/core';

import { Message } from 'primeng/message';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'osf-view-only-link-message',
  imports: [Message, TranslatePipe],
  templateUrl: './view-only-link-message.component.html',
  styleUrl: './view-only-link-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewOnlyLinkMessageComponent {}
