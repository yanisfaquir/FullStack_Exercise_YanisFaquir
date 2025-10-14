import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalculationHistory {
  n: number;
  value: string;
  calculationTime: number;
  fromCache: boolean;
  digits: number;
  timestamp: Date;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrls: ['./history.scss']
})
export class HistoryComponent {
  @Input() history: CalculationHistory[] = [];
  @Output() clearHistoryEvent = new EventEmitter<void>();
  @Output() loadFromHistoryEvent = new EventEmitter<number>();
  @Output() toggleChartEvent = new EventEmitter<void>();
  @Input() showChart: boolean = false;

  clearHistory(): void {
    this.clearHistoryEvent.emit();
  }

  loadFromHistory(n: number): void {
    this.loadFromHistoryEvent.emit(n);
  }

  toggleChart(): void {
    this.toggleChartEvent.emit();
  }
}