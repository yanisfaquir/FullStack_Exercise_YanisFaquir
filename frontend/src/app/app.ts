import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LabseqService, LabSeqResponse } from './services/labseq.service';
import { HeaderComponent } from './components/header/header';
import { CalculatorComponent } from './components/calculator/calculator';
import { HistoryComponent, CalculationHistory } from './components/history/history';
import { SequenceChartComponent } from './components/sequence-chart/sequence-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    CalculatorComponent,
    HistoryComponent,
    SequenceChartComponent
  ],
  providers: [LabseqService],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'LabSeq Calculator';
  apiStatus: string = 'Checking...';
  history: CalculationHistory[] = [];
  showChart: boolean = false;

  constructor(private labseqService: LabseqService) {}

  ngOnInit(): void {
    this.checkApiHealth();
    this.loadHistory();
  }

  checkApiHealth(): void {
    this.labseqService.checkHealth().subscribe({
      next: () => {
        this.apiStatus = 'Connected ✓';
      },
      error: () => {
        this.apiStatus = 'Disconnected ✗';
      }
    });
  }

  onResultCalculated(response: LabSeqResponse): void {
    this.showChart = false; // Fecha o gráfico ao calcular
    this.addToHistory(response);
  }

  addToHistory(response: LabSeqResponse): void {
    const historyItem: CalculationHistory = {
      n: response.n,
      value: response.value,
      calculationTime: response.calculationTime,
      fromCache: response.fromCache,
      digits: response.digits,
      timestamp: new Date()
    };

    // Remove duplicatas
    this.history = this.history.filter(item => item.n !== response.n);

    // Adiciona no início
    this.history.unshift(historyItem);
    
    // Mantém apenas 10 itens
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }

    this.saveHistory();
  }

  saveHistory(): void {
    try {
      localStorage.setItem('labseq-history', JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem('labseq-history');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
        this.history.forEach(item => {
          item.timestamp = new Date(item.timestamp);
        });
      }
    } catch (e) {
      console.error('Failed to load history', e);
      this.history = [];
    }
  }

  onClearHistory(): void {
    this.history = [];
    this.showChart = false;
    localStorage.removeItem('labseq-history');
  }

  onLoadFromHistory(n: number): void {
    // O Calculator component precisa receber esse valor
    // Por enquanto, apenas calcula novamente
    this.labseqService.getLabSeq(n).subscribe({
      next: (response: LabSeqResponse) => {
        this.onResultCalculated(response);
      }
    });
  }

  onToggleChart(): void {
    this.showChart = !this.showChart;
  }
}