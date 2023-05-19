import { Component, NgModule, OnInit } from '@angular/core';
import { DataService, SharedModule } from '@etech/admin-ui/package/core';
import {
  MetricInterval,
  MetricSummary,
  MetricSummaryQuery,
  MetricSummaryQueryVariables,
} from './generated/graphql';
import Chart from 'chart.js/auto';
import { GET_METRICS } from './queries.graphql';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'metrics-widget',
  template: `
    <div
      class="btn-group btn-outline-primary btn-sm"
      *ngIf="selection$ | async as selection"
    >
      <button
        class="btn"
        [class.btn-primary]="selection === 'WEEKLY'"
        (click)="selection$.next('WEEKLY')"
      >
        Weekly
      </button>
      <button
        class="btn"
        [class.btn-primary]="selection === 'MONTHLY'"
        (click)="selection$.next('MONTHLY')"
      >
        Monthly
      </button>
    </div>
    <br />

    <div *ngFor="let metric of metrics$ | async" class="chart-container">
      <canvas [id]="metric.code"></canvas>
    </div>
  `,
  styles: [
    '.chart-container { height: 200px; width: 33%; padding-right: 20px; display: inline-block; padding-top: 20px;}',
    '@media screen and (max-width: 768px) { .chart-container { width: 100%; } }',
  ],
})
export class MetricsWidgetComponent implements OnInit {
  metrics$:  Observable<MetricSummary[]> | undefined;
  charts: any[] = [];
  selection: MetricInterval = MetricInterval.MONTHLY;
   selection$ =  new BehaviorSubject<MetricInterval>(MetricInterval.MONTHLY);
  nrOfOrdersChart?: any;
  // Config for all charts
  config = {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        display: true,
      },
      grid: {
        display: false,
        drawBorder: false,
      },
    },
  };

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    // this.observe();
    this.metrics$ = this.selection$.pipe(
      switchMap((selection) => {
        return this.dataService
          .query<MetricSummaryQuery, MetricSummaryQueryVariables>(GET_METRICS, {
            input: {
              interval: selection,
            },
          })
          .refetchOnChannelChange()
          .mapStream((metricSummary) => {
            return metricSummary.metricSummary;
          });
      })
    );
    this.metrics$.subscribe(async (metrics) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for Angular redraw
      this.charts.forEach((chart) => chart.destroy());
      metrics.forEach((chartData) =>
        this.charts.push(this.createChart(chartData))
      );
    });
  }

  createChart(metric: MetricSummary) {
    const h = 196; // Vendure hue
    const s = 100;
    const l = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
    const color = h + ', ' + s + '%, ' + l + '%';
    return new Chart(metric.code, {
      type: 'bar',
      data: {
        // values on X-Axis
        labels: metric.entries.map((e) => e.label),
        datasets: [
          {
            label: metric.title,
            data: metric.entries.map((e) => e.value),
            backgroundColor: `hsla(${color}, 0.4)`,
            borderColor: `hsla(${color})`,
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: this.config,
      },
    });
  }
}

@NgModule({
  imports: [SharedModule],
  declarations: [MetricsWidgetComponent],
})
export class MetricsWidgetModule {}
