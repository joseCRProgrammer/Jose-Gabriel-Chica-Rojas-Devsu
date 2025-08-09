import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from 'src/app/shared/models/product.model';
import { PageHeader } from 'src/app/shared/page-header/page-header';
import { ProductForm } from 'src/app/shared/product-form/product-form';

@Component({
  standalone: true,
  selector: 'app-product-create',
  imports: [
    CommonModule,
    PageHeader,
    ProductForm
],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
})
export class ProductCreateComponent {
  loading = false;

  onCreate(p: Product) {
    console.log('CREATE ->', p);
  }
  onCancel() {
    console.log('cancel create');
  }
}
