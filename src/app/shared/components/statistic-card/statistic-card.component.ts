import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Primitive } from '@core/helpers';

@Component({
  selector: 'osf-statistic-card',
  templateUrl: './statistic-card.component.html',
  styleUrl: './statistic-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class StatisticCardComponent {
  value = input<Primitive>();
  label = input<string>('');
}
