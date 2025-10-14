import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigNumberPipe } from '../../pipes/big-number.pipe';

@Component({
  selector: 'app-number-display',
  standalone: true,
  imports: [CommonModule, BigNumberPipe],
  template: `
    <div class="number-display">
      <!-- Informações sobre o número -->
      <div class="number-info">
        <span class="info-badge">
          <strong>{{ digits }}</strong> digits
        </span>
        <span class="info-badge" *ngIf="digits > 50">
          <strong>{{ formatBytes(digits) }}</strong> size
        </span>
      </div>

      <!-- Abas de visualização -->
      <div class="view-tabs">
        <button 
          *ngFor="let mode of viewModes"
          [class.active]="currentMode === mode.id"
          (click)="currentMode = mode.id"
          class="tab-btn">
          {{ mode.label }}
        </button>
      </div>

      <!-- Valor formatado -->
      <div class="number-value" [ngClass]="'mode-' + currentMode">
        <code>{{ value | bigNumber:currentMode }}</code>
      </div>


    </div>
  `,
  styles: [`
    .number-display {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
    }

    .number-info {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .info-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .view-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      border-bottom: 2px solid #dee2e6;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      color: #6c757d;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: #495057;
      background: #f8f9fa;
    }

    .tab-btn.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .number-value {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;
      overflow-x: auto;
      max-height: 300px;
    }

    .number-value code {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #212529;
      word-break: break-all;
    }

    .mode-scientific code {
      font-size: 1.1rem;
      color: #0056b3;
    }

    .btn-copy {
      width: 100%;
      padding: 10px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-copy:hover {
      background: #0056b3;
    }

    .btn-copy.copied {
      background: #28a745;
    }
  `]
})
export class NumberDisplayComponent {
  @Input() value: string = '';
  @Input() digits: number = 0;

  currentMode: 'compact' | 'scientific' | 'full' = 'compact';
  copied: boolean = false;

  viewModes = [
    { id: 'compact' as const, label: 'Compact' },
    { id: 'scientific' as const, label: 'Scientific' },
    { id: 'full' as const, label: 'Full' }
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