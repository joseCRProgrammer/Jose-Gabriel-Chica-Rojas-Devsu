import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() page = 1;

  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() showSizeSelector = true;

  @Input() maxButtons = 5;

  @Input() edgeButtons = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages = 1;
  visible: number[] = [];
  showStartEllipsis = false;
  showEndEllipsis = false;

  ngOnChanges(): void {
    this.recompute();
  }

  private recompute() {
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.page = Math.min(Math.max(1, this.page), this.totalPages);

    const max = Math.max(1, this.maxButtons);

    if (max === 1) {
      this.visible = [this.page];
      this.showStartEllipsis = this.edgeButtons && this.page > 1;
      this.showEndEllipsis   = this.edgeButtons && this.page < this.totalPages;
      return;
    }

    if (!this.edgeButtons && this.totalPages <= max) {
      this.visible = this.range(1, this.totalPages);
      this.showStartEllipsis = this.showEndEllipsis = false;
      return;
    }

    const reserveEdges = this.edgeButtons ? 2 : 0;
    if (this.totalPages <= max + reserveEdges) {
      this.visible = this.edgeButtons
        ? this.range(2, this.totalPages - 1)
        : this.range(1, this.totalPages);
      this.showStartEllipsis = this.showEndEllipsis = false;
      return;
    }

    let windowSize = max;
    let start: number;
    let end: number;

    if (this.edgeButtons) {
      const half = Math.floor(windowSize / 2);
      start = this.page - half;
      end = this.page + (windowSize - half - 1);

      if (start < 2) { start = 2; end = start + windowSize - 1; }
      if (end > this.totalPages - 1) { end = this.totalPages - 1; start = end - windowSize + 1; }

      this.visible = this.range(start, end);
      this.showStartEllipsis = start > 2;
      this.showEndEllipsis   = end < this.totalPages - 1;
    } else {
      const half = Math.floor(windowSize / 2);
      start = this.page - half;
      end = this.page + (windowSize - half - 1);

      if (start < 1) { start = 1; end = start + windowSize - 1; }
      if (end > this.totalPages) { end = this.totalPages; start = end - windowSize + 1; }

      this.visible = this.range(start, end);
      this.showStartEllipsis = start > 1;
      this.showEndEllipsis   = end < this.totalPages;
    }
  }

  private range(a: number, b: number): number[] {
    const out: number[] = [];
    for (let i = a; i <= b; i++) out.push(i);
    return out;
  }

  prev() { if (this.page > 1) this.goto(this.page - 1); }
  next() { if (this.page < this.totalPages) this.goto(this.page + 1); }

  goto(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.pageChange.emit(this.page);
    this.recompute();
  }

  onChangeSize(v: string | number) {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    if (!Number.isFinite(n) || n <= 0) return;
    this.pageSize = n;
    this.pageSizeChange.emit(n);
    this.page = 1;
    this.recompute();
  }
}
