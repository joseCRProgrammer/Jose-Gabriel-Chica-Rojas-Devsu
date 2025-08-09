import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonColor = 'gray' | 'yellow' | 'outline';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss']
})
export class ButtonComponent {
  @Input() label = '';
  @Input() color: ButtonColor = 'gray';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) this.clicked.emit();
  }
}
