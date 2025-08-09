import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/shared/models/product.model';
import { PageHeader } from 'src/app/shared/page-header/page-header';
import { ProductForm } from 'src/app/shared/product-form/product-form';

@Component({
  selector: 'app-product-edit',
  imports: [
    CommonModule,
    ProductForm,
    PageHeader
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})

export class ProductEditComponent implements OnInit {
  loading = false;
  product: Product | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.product = {
      id,
      name: 'Tarjeta Crédito',
      description: 'Descripción demo',
      logo: 'https://picsum.photos/seed/edit/48/48',
      date_release: '2025-08-08',
      date_revision: '2026-08-08'
    };
  }

  onUpdate(p: Product) {
    console.log('UPDATE ->', p);
  }

  onCancel() {
    console.log('cancel edit');
  }
}