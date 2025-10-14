import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bigNumber',
  standalone: true
})
export class BigNumberPipe implements PipeTransform {
  
  /**
   * Formata números grandes para exibição:
   * - Números pequenos (< 50 dígitos): exibe completo
   * - Números médios (50-100 dígitos): exibe início + "..." + fim
   * - Números grandes (> 100 dígitos): exibe notação científica aproximada
   */
  transform(value: string, displayMode: 'full' | 'compact' | 'scientific' = 'compact'): string {
    if (!value || value === 'Infinity') {
      return 'Error: Number too large';
    }

    const numDigits = value.length;

    // Modo full: mostra tudo (útil para copiar)
    if (displayMode === 'full') {
      return value;
    }

    // Modo scientific: sempre mostra em notação científica
    if (displayMode === 'scientific') {
      return this.toScientific(value);
    }

    // Modo compact (padrão): adapta baseado no tamanho
    if (numDigits <= 50) {
      // Números pequenos: mostra completo com separadores
      return this.addThousandsSeparators(value);
    } else if (numDigits <= 100) {
      // Números médios: mostra início e fim
      const start = value.substring(0, 40);
      const end = value.substring(value.length - 20);
      return `${this.addThousandsSeparators(start)}...${end}`;
    } else {
      // Números grandes: notação científica
      return this.toScientific(value);
    }
  }

 
    // Adiciona separadores de milhares
   
  private addThousandsSeparators(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

 
  //  Converte para notação científica aproximada
   
  private toScientific(value: string): string {
    const numDigits = value.length;
    const mantissa = value.substring(0, 1) + '.' + value.substring(1, 6);
    const exponent = numDigits - 1;
    return `${mantissa} × 10^${exponent}`;
  }
}