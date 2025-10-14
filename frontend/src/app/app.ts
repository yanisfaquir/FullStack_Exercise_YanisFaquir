import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LabseqService, LabSeqResponse } from './services/labseq.service';
import { NumberDisplayComponent } from './components/number-display/number-display.component';
import { SequenceChartComponent } from './components/sequence-chart/sequence-chart.component';

interface CalculationHistory {
  n: number;
  value: string;
  calculationTime: number;
  fromCache: boolean;
  digits: number;
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    NumberDisplayComponent, 
    SequenceChartComponent
  ],
  providers: [LabseqService],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'LabSeq Calculator';
  inputValue: number | null = null;
  result: LabSeqResponse | null = null;
  error: string | null = null;
  loading: boolean = false;
  history: CalculationHistory[] = [];
  apiStatus: string = 'Checking...';
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

  calculate(): void {
    if (this.inputValue === null || this.inputValue === undefined) {
      this.error = 'Please enter a valid number';
      return;
    }

    if (this.inputValue < 0) {
      this.error = 'Index must be a non-negative integer';
      return;
    }

    if (!Number.isInteger(this.inputValue)) {
      this.error = 'Index must be an integer';
      return;
    }

    this.showChart = false;

    this.error = null;
    this.loading = true;

    this.labseqService.getLabSeq(this.inputValue).subscribe({
      next: (response: LabSeqResponse) => {
        this.result = response;
        this.loading = false;
        this.addToHistory(response);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.result = null;
        this.loading = false;
      }
    });
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

  this.history = this.history.filter(item => item.n !== response.n);
  this.history.unshift(historyItem);

  
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

  clearHistory(): void {
    this.history = [];
    this.showChart = false;
    localStorage.removeItem('labseq-history');
  }

  reset(): void {
    this.inputValue = null;
    this.result = null;
    this.error = null;
  }

  loadFromHistory(n: number): void {
    this.inputValue = n;
    this.calculate();
  }


  
}