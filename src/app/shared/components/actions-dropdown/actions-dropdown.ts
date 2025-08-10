import { CommonModule } from '@angular/common';
import {
  Component, ElementRef, EventEmitter, HostListener,
  Input, Output, ViewChild, OnDestroy
} from '@angular/core';

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
export class ActionsDropdownComponent implements OnDestroy {
  @Input() actions: ActionItem[] = [];
  @Input() icon = '';
  @Input() triggerAria = 'Abrir menú de acciones';

  @Output() selected = new EventEmitter<string>();

  @ViewChild('triggerBtn', { static: false }) triggerRef?: ElementRef<HTMLElement>;
  @ViewChild('menuBox',    { static: false }) menuRef?: ElementRef<HTMLElement>;

  constructor(private host: ElementRef<HTMLElement>) {}

  private static opened: ActionsDropdownComponent | null = null;

  open = false;

  private readonly GAP = 6;
  private readonly PAD = 8;
  private ignoreDocClick = false;

  ngOnDestroy(): void {
    if (ActionsDropdownComponent.opened === this) {
      ActionsDropdownComponent.opened = null;
    }
  }

  toggle(e: MouseEvent) {
    e.stopPropagation();

    if (this.open) {
      this.close();
      return;
    }

    if (ActionsDropdownComponent.opened && ActionsDropdownComponent.opened !== this) {
      ActionsDropdownComponent.opened.close();
    }
    ActionsDropdownComponent.opened = this;

    this.open = true;

    this.ignoreDocClick = true;
    setTimeout(() => (this.ignoreDocClick = false), 0);

    requestAnimationFrame(() => this.positionMenu());
  }

  close() {
    if (!this.open) return;
    this.open = false;
    if (ActionsDropdownComponent.opened === this) {
      ActionsDropdownComponent.opened = null;
    }
  }

  choose(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (!this.open) return;
    this.close();
    this.selected.emit(id);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.open) return;
    if (this.ignoreDocClick) return;
    const inside = this.host.nativeElement.contains(ev.target as Node);
    if (!inside) this.close();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(ev: KeyboardEvent) {
    if (this.open) { ev.stopPropagation(); this.close(); }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange() {
    if (this.open) this.positionMenu();
  }

  private positionMenu() {
    const btn  = this.triggerRef?.nativeElement;
    const menu = this.menuRef?.nativeElement;
    if (!btn || !menu) return;

    menu.style.position = 'fixed';
    menu.style.left = '-10000px';
    menu.style.top  = '-10000px';
    menu.style.visibility = 'hidden';
    menu.style.zIndex = '9999';

    const br = btn.getBoundingClientRect();
    const rect = menu.getBoundingClientRect();
    const mw = rect.width || menu.offsetWidth;
    const mh = rect.height || menu.offsetHeight;

    let top = br.bottom + this.GAP;
    if (top + mh > window.innerHeight) top = br.top - this.GAP - mh;
    top = Math.max(this.PAD, Math.min(top, window.innerHeight - mh - this.PAD));

    let left = br.right - mw;
    left = Math.max(this.PAD, Math.min(left, window.innerWidth - mw - this.PAD));

    menu.style.top = `${Math.round(top)}px`;
    menu.style.left = `${Math.round(left)}px`;
    menu.style.visibility = 'visible';
  }
}
