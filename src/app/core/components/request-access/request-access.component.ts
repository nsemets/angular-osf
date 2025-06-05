import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'osf-request-access',
  imports: [TranslatePipe, Button],
  templateUrl: './request-access.component.html',
  styleUrl: './request-access.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestAccessComponent {}
