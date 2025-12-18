import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';

@Component({
  selector: 'osf-spam-tombstone',
  imports: [TranslatePipe],
  templateUrl: './spam-tombstone.component.html',
  styleUrl: './spam-tombstone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpamTombstoneComponent {
  private readonly environment = inject(ENVIRONMENT);
  readonly supportEmail = this.environment.supportEmail;
}
