import { TranslatePipe } from '@ngx-translate/core';

import { SelectModule } from 'primeng/select';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { IS_XSMALL } from '@osf/shared/utils/breakpoints.tokens';

import { LineChartComponent } from '../../../shared/components/line-chart/line-chart.component';

import { AnalyticsKpiComponent } from './components/analytics-kpi/analytics-kpi.component';
import { DATE_RANGE_OPTIONS } from './constants/analytics-constants';

@Component({
  selector: 'osf-analytics',
  imports: [
    CommonModule,
    FormsModule,
    SubHeaderComponent,
    AnalyticsKpiComponent,
    SelectModule,
    TranslatePipe,
    LineChartComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  isMobile = toSignal(inject(IS_XSMALL));
  rangeOptions = DATE_RANGE_OPTIONS;
  selectedRange = signal(DATE_RANGE_OPTIONS[0]);

  chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  chartDatasets = [
    {
      label: 'Views',
      data: [1200, 1900, 1500, 2500, 2200, 3000, 2800, 3500],
    },
  ];
}
