import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Product } from 'src/app/core/models/product.model';
import { PageHeader } from 'src/app/shared/components/page-header/page-header';
import { ProductForm } from 'src/app/shared/components/product-form/product-form';

import { ProductFacade } from 'src/app/application/facades/product.facade';
import { ToastService } from 'src/app/shared/components/toast/toast.service';


@Component({
  standalone: true,
  selector: 'app-product-create',
  imports: [CommonModule, PageHeader, ProductForm],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
})
export class ProductCreateComponent {
  private facade = inject(ProductFacade);
  private router = inject(Router);
  private toast =  inject(ToastService);

  readonly loading = this.facade.loading;
  readonly error   = this.facade.error;

  async onCreate(p: Product) {
    // Verificar ID antes de crear
    const idAvailable = await this.facade.verifyId(p.id);

    if (idAvailable) {
      this.facade.clearError(); // limpia error anterior
      const message = `El producto "${p.id}" ya existe en la base de datos`;
      this.facade['_' + 'error'].set(message);
      this.toast.error(message);
      return;
    }

    // Crear producto
    const ok = await this.facade.create(p);
    if (ok) {
      this.toast.success('Producto creado con éxito');
      this.router.navigate(['/dashboard/products/list']);
    }
  }
}
