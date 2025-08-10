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

  @Input() title = '';

  @Input() icon: string | null = null;

  @Input() iconSize = 22;

  @Input() showDivider = false;

  get isMaterialIcon(): boolean {
    return !!this.icon && /^[a-z0-9_]+$/i.test(this.icon);
  }
}
