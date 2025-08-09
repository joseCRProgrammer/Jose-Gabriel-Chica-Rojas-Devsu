import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductFacade } from 'src/app/application/facades/product.facade';
import { Product } from 'src/app/core/models/product.model';
import { PageHeader } from 'src/app/shared/components/page-header/page-header';
import { ProductForm } from 'src/app/shared/components/product-form/product-form';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

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

export class ProductEditComponent implements OnInit, OnDestroy {
  loading = false;
  product: Product | null = null;
  private facade = inject(ProductFacade);
  private router = inject(Router);
  private toast =  inject(ToastService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.product = this.facade.getByIdLocal(id);
    console.log("este es el editar", this.product)
    
  }

  onUpdate(p: Product) {
    console.log('UPDATE ->', p);
  }

  ngOnDestroy(): void{
    history.state.fromEditButton = false
  }

}