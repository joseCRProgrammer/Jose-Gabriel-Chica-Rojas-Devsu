import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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

export class ProductEditComponent implements OnInit {
  loading = false;
  product: Product | null = null;
  private facade = inject(ProductFacade);
  private router = inject(Router);
  private toast =  inject(ToastService);
  private id;
  readonly error   = this.facade.error;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.product = this.facade.getByIdLocal(this.id);
    
  }

  async onUpdate(p: Product) {
      // Verificar ID antes de actualizar
    const idAvailable = await this.facade.verifyId(p.id);

    if (!idAvailable) {
      this.facade.clearError();
      const message = `El producto "${p.id}" no existe o fue borrado recientemente`;
      this.facade['_' + 'error'].set(message);
      this.toast.error(message);
      return;
    }

     // Actualizar producto
    const ok = await this.facade.update(this.id, p);
    if (ok) {
      this.toast.success('Producto actualizado con éxito');
      this.router.navigate(['/dashboard/products/list']);
    }
    else{
      const errPayload: any = this.error();
      const nodes = Array.isArray(errPayload?.error) ? errPayload.error : errPayload;
      
      const summary = Array.isArray(nodes)
        ? nodes.flatMap((n: any) => Object.values(n?.constraints || {})).slice(0,3).join(' | ')
        : 'Revisa los campos marcados.';
      this.toast.error(`Error en el servidor Validación: ${summary}`);
      this.facade.clearError();
    }  
  }
}