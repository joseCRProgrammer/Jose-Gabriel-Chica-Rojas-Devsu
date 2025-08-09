import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss']
})
export class ModalComponent {
  @Input() open = false;

  @Input() message = '¿Estás seguro de eliminar el producto';

  @Input() cancelLabel = 'Cancelar';
  @Input() confirmLabel = 'Confirmar';

  @Input() confirmDisabled = false;

  @Input() closeOnBackdrop = true;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(ev: KeyboardEvent) {
    if (!this.open) return;
    ev.stopPropagation();
    this.triggerCancel();
  }

  onBackdropClick() {
    if (!this.open || !this.closeOnBackdrop) return;
    this.triggerCancel();
  }

  stop(e: MouseEvent) {
    e.stopPropagation();
  }

  triggerCancel() {
    this.open = false;
    this.cancel.emit();
    this.closed.emit();
  }

  triggerConfirm() {
    if (this.confirmDisabled) return;
    this.open = false;
    this.confirm.emit();
    this.closed.emit();
  }
}
