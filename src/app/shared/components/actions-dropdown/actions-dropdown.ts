import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'actions-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-dropdown.html',
  styleUrls: ['./actions-dropdown.scss']
})
export class ActionsDropdownComponent {
  @Input() actions: ActionItem[] = [];
  @Input() icon = '';
  @Input() triggerAria = 'Abrir menú de acciones';

  @Output() selected = new EventEmitter<string>();

  open = false;

  toggle(e: MouseEvent) {
    e.stopPropagation();
    this.open = !this.open;
  }

  choose(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (!this.open) return;
    this.open = false;
    this.selected.emit(id);
  }

  @HostListener('document:click')
  onDocClick() {
    if (this.open) this.open = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(ev: KeyboardEvent) {
    if (this.open) { ev.stopPropagation(); this.open = false; }
  }
}
