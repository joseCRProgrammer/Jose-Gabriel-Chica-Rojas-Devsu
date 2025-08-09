import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.scss']
})
export class PageHeader {
  /** Texto del encabezado */
  @Input() title = '';

  /**
   * Nombre del ícono de Material (ej. "account_balance") o emoji
   * Si es un emoji, se mostrará como texto normal.
   */
  @Input() icon: string | null = null;

  /** Tamaño del ícono o emoji en px */
  @Input() iconSize = 22;

  /** Mostrar divisor debajo del encabezado */
  @Input() showDivider = false;

  /** Detecta si el icono es Material o emoji/texto */
  get isMaterialIcon(): boolean {
    return !!this.icon && /^[a-z0-9_]+$/i.test(this.icon);
  }
}
