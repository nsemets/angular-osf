import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'osf-analytics-kpi',
  imports: [Button, TranslatePipe],
  templateUrl: './analytics-kpi.component.html',
  styleUrl: './analytics-kpi.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsKpiComponent {
  showButton = input<boolean>(false);
  buttonLabel = input<string>('');
  title = input<string>('');
  value = input<string>('');
}
