import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabseqService, LabSeqResponse } from '../../services/labseq.service';
import { NumberDisplayComponent } from '../number-display/number-display.component';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberDisplayComponent],
  templateUrl: './calculator.html',
  styleUrls: ['./calculator.scss']
})
export class CalculatorComponent {
  @Output() resultCalculated = new EventEmitter<LabSeqResponse>();

  inputValue: number | null = null;
  result: LabSeqResponse | null = null;
  error: string | null = null;
  loading: boolean = false;

  constructor(private labseqService: LabseqService) {}

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
        this.resultCalculated.emit(response); 
      },
      error: (error: Error) => {
        this.error = error.message;
        this.result = null;
        this.loading = false;
      }
    });
  }

  reset(): void {
    this.inputValue = null;
    this.result = null;
    this.error = null;
  }
}