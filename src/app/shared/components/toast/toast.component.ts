// src/app/shared/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="toast-container">
    <div 
      class="toast" 
      *ngFor="let toast of toastService.messages()"
      [class]="toast.type">
      <span>{{ toast.message }}</span>
      <button class="close-btn" (click)="toastService.remove(toast.id)">×</button>
    </div>
  </div>
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toastService = inject(ToastService);
}
