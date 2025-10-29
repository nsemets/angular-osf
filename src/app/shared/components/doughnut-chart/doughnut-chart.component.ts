import { TranslatePipe } from '@ngx-translate/core';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';

import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, PLATFORM_ID, signal } from '@angular/core';

import { PIE_CHART_PALETTE } from '@osf/shared/constants/pie-chart-palette';
import { DatasetInput } from '@shared/models/charts/dataset-input';

import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'osf-doughnut-chart',
  imports: [
    ChartModule,
    TranslatePipe,
    LoadingSpinnerComponent,
    Accordion,
    AccordionHeader,
    AccordionPanel,
    AccordionContent,
  ],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughnutChartComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  isLoading = input<boolean>(false);
  title = input<string>('');
  labels = input<string[]>([]);
  datasets = input<DatasetInput[]>([]);
  showLegend = input<boolean>(false);
  showExpandedSection = input<boolean>(false);

  options = signal<ChartOptions<'doughnut'> | null>(null);
  data = signal<ChartData | null>(null);

  readonly PIE_CHART_PALETTE = PIE_CHART_PALETTE;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setChartData();
      this.setChartOptions();
    }
  }

  private setChartData() {
    const chartDatasets = this.datasets().map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset?.color || PIE_CHART_PALETTE,
      borderWidth: 0,
    }));

    this.data.set({
      labels: this.labels(),
      datasets: chartDatasets,
    });
  }

  private setChartOptions() {
    this.options.set({
      cutout: '60%',
      maintainAspectRatio: true,
      responsive: true,
      plugins: {
        legend: {
          display: this.showLegend(),
          position: 'bottom',
        },
      },
    });
  }
}
