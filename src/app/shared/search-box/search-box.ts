import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-box.html',
  styleUrls: ['./search-box.scss']
})
export class SearchBox {
  @Input() placeholder = 'Buscar...';
  @Output() searchChange = new EventEmitter<string>();

  query = '';

  onSearchChange() {
    this.searchChange.emit(this.query);
  }
}
