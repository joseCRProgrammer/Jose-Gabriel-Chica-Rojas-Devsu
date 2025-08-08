// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'product-list',
  imports: [
    CommonModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  public loading = false;
  private toastr = inject(ToastrService);

  constructor() {
  
  }

  
}
