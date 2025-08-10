import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActionItem, ActionsDropdownComponent } from '../actions-dropdown/actions-dropdown';
import { PaginationComponent } from '../pagination/pagination';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  accessor?: (row: T) => any;
  widthPx?: number;
}

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, ActionsDropdownComponent, PaginationComponent],
  templateUrl: './product-table.html',
  styleUrls: ['./product-table.scss']
})
export class ProductTable<T = any> implements OnChanges {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];

  @Input() showActions = true;
  @Input() actions: ActionItem[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'delete', label: 'Eliminar', icon: 'delete' }
  ];

  @Input() pageSize = 5;
  @Input() pageSizeOptions: number[] = [5, 10, 20];

  @Input() loading = false;
  @Input() errorMsg: string | null = null;

  @Output() action = new EventEmitter<{ actionId: string; row: T }>();

  term = '';
  page = 1;
  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  viewRows: T[] = [];
  totalFiltered = 0;

  ngOnChanges(_: SimpleChanges): void {
    this.recompute();
  }

  applyFilter(v: string) {
    this.term = (v ?? '').trim().toLowerCase();
    this.page = 1;
    this.recompute();
  }

  changePageSize(size: number) {
    if (!Number.isFinite(size) || size <= 0) return;
    this.pageSize = size;
    this.page = 1;
    this.recompute();
  }

  sortBy(col: TableColumn<T>) {
    if (!col.sortable) return;
    if (this.sortKey === col.key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = col.key;
      this.sortDir = 'asc';
    }
    this.recompute();
  }

  goTo(page: number) {
    const max = Math.max(1, Math.ceil(this.totalFiltered / this.pageSize));
    this.page = Math.min(Math.max(1, page), max);
    this.recompute(false);
  }

  onActionClick(actionId: string, row: T) {
    this.action.emit({ actionId, row });
  }

  rowLabel(row: T): string {
    const r = row as any;
    return (r?.name ?? r?.id ?? '') + '';
  }

  trackRow = (index: number, row: T) => {
    const r = row as any;
    return r?.id ?? index;
  };

  cell(row: any, col: TableColumn<T>) {
    return col.accessor ? col.accessor(row) : row?.[col.key];
  }

  private recompute(resetSort = false) {
    if (resetSort) {
      this.sortKey = null;
      this.sortDir = 'asc';
    }

    let rows = [...(this.data || [])];

    if (this.term) {
      const cols = this.columns;
      rows = rows.filter(r =>
        cols.some(c => {
          const v = (c.accessor ? c.accessor(r) : (r as any)[c.key]) ?? '';
          return v.toString().toLowerCase().includes(this.term);
        })
      );
    }

    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      const key = this.sortKey;
      rows.sort((a: any, b: any) => {
        const va = a?.[key];
        const vb = b?.[key];
        if (va == null && vb == null) return 0;
        if (va == null) return -1 * dir;
        if (vb == null) return 1 * dir;

        const na = Number(va), nb = Number(vb);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dir;

        const sa = va.toString().toLowerCase?.() ?? va;
        const sb = vb.toString().toLowerCase?.() ?? vb;
        if (sa < sb) return -1 * dir;
        if (sa > sb) return 1 * dir;
        return 0;
      });
    }

    this.totalFiltered = rows.length;
    const start = (this.page - 1) * this.pageSize;
    this.viewRows = rows.slice(start, start + this.pageSize);
  }
}
