import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigNumberPipe } from '../../pipes/big-number.pipe';

@Component({
  selector: 'app-number-display',
  standalone: true,
  imports: [CommonModule, BigNumberPipe],
  templateUrl: './number-display.component.html',
  styleUrls: ['./number-display.component.scss']
})
export class NumberDisplayComponent {
  @Input() value: string = '';
  @Input() digits: number = 0;

  currentMode: 'compact' | 'scientific' | 'full' = 'compact';
  copied: boolean = false;

  viewModes = [
    { id: 'full' as const, label: 'Full' }
    { id: 'scientific' as const, label: 'Scientific' },
  
  ];

  formatBytes(digits: number): string {
    const bytes = digits;
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.value).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}