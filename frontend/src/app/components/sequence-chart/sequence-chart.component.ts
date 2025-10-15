import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface ChartDataPoint {
  n: number;
  digits: number;
  time: number;
  valuePreview: string;
}

@Component({
  selector: 'app-sequence-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './sequence-chart.html',
  styleUrls: ['./sequence-chart.scss']
})
export class SequenceChartComponent implements OnChanges, AfterViewInit {
  @Input() history: any[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartDataPoint[] = [];
  activeTab: 'growth' | undefined ;
  lineChartType: ChartType = 'line';
  
  private isChartReady = false;

  chartTabs = [
    { id: 'growth' as const, label: 'Growth', icon: '📈' },

  ];

  // Growth Chart Data
  growthChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  growthChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${context.parsed.y} digits`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Index (n)',
          font: { size: 14, weight: 'bold' }
        },
        grid: { display: false }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Digits',
          font: { size: 14, weight: 'bold' }
        },
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };



 

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.isChartReady = true;
    console.log('✅ Chart component ready');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['history'] && this.history) {
      console.log('📊 History updated:', this.history.length, 'items');
      this.updateChartData();
    }
  }

  switchTab(tab: 'growth'): void {
    this.activeTab = tab;
    console.log('📊 Switched to tab:', tab);
  }

  private updateChartData(): void {
    // Pega os últimos 10 itens do histórico e ordena por n
    this.chartData = this.history
      .slice(0, 10)
      .map(item => ({
        n: item.n,
        digits: item.digits,
        time: item.calculationTime,
        valuePreview: item.value
      }))
      .sort((a, b) => a.n - b.n);

    console.log('📊 Chart data prepared:', this.chartData.length, 'points');

    if (this.chartData.length === 0) {
      return;
    }

    // Prepara labels e dados
    const labels = this.chartData.map(d => d.n.toString());
    const digitsData = this.chartData.map(d => d.digits);
    const timeData = this.chartData.map(d => d.time);

    // Atualiza gráfico de crescimento
    this.growthChartData = {
      labels: labels,
      datasets: [{
        label: 'Number of Digits',
        data: digitsData,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };


    // Força detecção de mudanças
    this.cdr.detectChanges();

    // Atualiza o gráfico
    if (this.isChartReady && this.chart) {
      setTimeout(() => {
        this.chart?.update();
        console.log('✅ Chart updated successfully!');
      }, 100);
    }
  }
}