import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { paginate, PaginationState } from './utils/pagination-utils';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  state: PaginationState = {
    totalPages: 1,
    visible: [1],
    showStartEllipsis: false,
    showEndEllipsis: false,
    currentPage: 1
  };

  ngOnChanges(_: SimpleChanges): void {
    this.recompute();
  }

  prev(): void {
    if (this.state.currentPage > 1) this.goto(this.state.currentPage - 1);
  }

  next(): void {
    if (this.state.currentPage < this.state.totalPages) this.goto(this.state.currentPage + 1);
  }

  goto(p: number): void {
    if (p < 1 || p > this.state.totalPages || p === this.state.currentPage) return;
    this.page = p;
    this.pageChange.emit(p);
    this.recompute();
  }

  onChangeSize(v: string | number): void {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    if (!Number.isFinite(n) || n <= 0 || n === this.pageSize) return;
    this.pageSize = n;
    this.pageSizeChange.emit(n);
    this.page = 1;
    this.recompute();
  }

  trackByPage = (_: number, val: number) => val;

  private recompute(): void {
    this.state = paginate(this.total, this.pageSize, this.page, this.maxButtons, this.edgeButtons);
    this.page = this.state.currentPage; // sincroniza Input externo si viene fuera de rango
  }
}
