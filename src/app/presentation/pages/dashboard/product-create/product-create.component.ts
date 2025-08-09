import { Component, inject, ViewChild } from '@angular/core';
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
  private router  = inject(Router);
  private toast   = inject(ToastService);

  readonly loading = this.facade.loading;
  readonly error   = this.facade.error;

  async onCreate(p: Product) {
    // 1) Verificar ID (true = existe)
    const idExists = await this.facade.verifyId(p.id);
    if (idExists) {
      this.toast.error(`El producto "${p.id}" ya existe en la base de datos`);
      return;
    }

    // 2) Crear
    const ok = await this.facade.create(p);
    if (ok) {
      this.toast.success('Producto creado con éxito');
      this.router.navigate(['/dashboard/products/list']);
      return;
    }
    else{
      const errPayload: any = this.error();
      const nodes = Array.isArray(errPayload?.error) ? errPayload.error : errPayload;
      
      const summary = Array.isArray(nodes)
        ? nodes.flatMap((n: any) => Object.values(n?.constraints || {})).slice(0,3).join(' | ')
        : 'Revisa los campos marcados.';
      this.toast.error(`Error en el servidor Validación: ${summary}`);
      this.facade.clearError();
      return;
    }

    
  }
}
