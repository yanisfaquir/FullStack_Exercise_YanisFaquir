import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LabseqService, LabSeqResponse } from './services/labseq.service';

interface CalculationHistory {
  index: number;
  value: string;
  calculationTimeMs: number;
  fromCache: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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

  constructor(private labseqService: LabseqService) {}

  ngOnInit(): void {
    this.checkApiHealth();
    this.loadHistory();
  }

  /**
   * Check if the backend API is available
   */
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

  /**
   * Calculate LabSeq value
   */
  calculate(): void {
    // Validation
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

    // Reset states
    this.error = null;
    this.loading = true;

    // Call API
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

  /**
   * Add calculation to history
   */
  addToHistory(response: LabSeqResponse): void {
    const historyItem: CalculationHistory = {
      ...response,
      timestamp: new Date()
    };

    this.history.unshift(historyItem);
    
    // Keep only last 10 items
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }

    // Save to localStorage
    this.saveHistory();
  }

  /**
   * Save history to localStorage
   */
  saveHistory(): void {
    try {
      localStorage.setItem('labseq-history', JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  /**
   * Load history from localStorage
   */
  loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem('labseq-history');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        this.history.forEach(item => {
          item.timestamp = new Date(item.timestamp);
        });
      }
    } catch (e) {
      console.error('Failed to load history', e);
      this.history = [];
    }
  }

  /**
   * Clear calculation history
   */
  clearHistory(): void {
    this.history = [];
    localStorage.removeItem('labseq-history');
  }

  /**
   * Reset form
   */
  reset(): void {
    this.inputValue = null;
    this.result = null;
    this.error = null;
  }

  /**
   * Load value from history
   */
  loadFromHistory(index: number): void {
    this.inputValue = index;
    this.calculate();
  }
}