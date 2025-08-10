import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from 'src/app/core/models/product.model';
import { ProductTable, TableColumn } from 'src/app/shared/components/product-table/product-table';
import { SearchBox } from 'src/app/shared/components/search-box/search-box';
import { ButtonComponent } from 'src/app/shared/components/button/button';
import { Router } from '@angular/router';
import { ModalComponent } from 'src/app/shared/components/modal/modal';
import { ProductFacade } from 'src/app/application/facades/product.facade';
import { EditIntentService } from 'src/app/shared/services/edit-intent.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'product-list',
  imports: [
    CommonModule,
    ProductTable,
    SearchBox,
    ButtonComponent,
    ModalComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})

export class ProductListComponent implements OnInit {

  @ViewChild('tbl') table!: ProductTable<Product>;

  loading = this.facade.loading();
  errorMsg = null

  confirmOpen = false;
  productToDelete: Product | null = null;

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];


  cols: TableColumn<Product>[] = [
    { key: 'logo', header: 'Logo', sortable: false, widthPx: 80, accessor: p => p.logo },
    { key: 'name', header: 'Nombre del producto', sortable: true },
    { key: 'description', header: 'Descripción', sortable: true },
    { key: 'date_release', header: 'Fecha de liberación', sortable: true },
    { key: 'date_revision', header: 'Fecha de reestructuración', sortable: true }
  ];

  rowActions = [
    { id: 'edit', label: 'Editar', icon: '📝' },
    { id: 'delete', label: 'Eliminar', icon: '❌' }
  ];
  constructor(
    private router: Router,
    private facade: ProductFacade,
    private editIntent: EditIntentService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts()
  }

  async loadProducts(){
    const ok = await this.facade.loadAll();
    this.allProducts = this.facade.all();
    this.filteredProducts = [...this.allProducts];
  }

  onSearch(term: string) {    
    if (this.table?.applyFilter) {
      this.table.applyFilter(term);
    }
  }

  onAddProduct() {
    this.router.navigate(['/dashboard/products/create']);
  }

  onDelete(p: Product) {
    if (!confirm(`¿Eliminar ${p.name}?`)) return;
  }

  async onAction(ev: { actionId: string; row: Product }) {
    if (ev.actionId === 'delete') {
      this.productToDelete = ev.row;
      this.confirmOpen = true;
    }
    
    if (ev.actionId === 'edit') {

      const exist = await this.facade.verifyId(ev.row.id)
      console.log(exist)
      if(exist){
          const token = this.editIntent.allowOnce(ev.row.id);
          this.router.navigate(['/dashboard/products/edit', ev.row.id],
          { queryParams: { token } });
      }
      else{
        this.toast.error("El producto a editar ya no existe, puede ser que lo hayan eliminado previamente")
      }
      
    }
  }

    cancelDelete() {
    this.confirmOpen = false;
    this.productToDelete = null;
  }

  async confirmDelete() {
    if (!this.productToDelete) return;
    const id = this.productToDelete.id;
    const exist = await this.facade.verifyId(id);
    if(exist){
      await this.facade.remove(id);
      this.allProducts = this.allProducts.filter(p => p.id !== id);
      this.filteredProducts = this.allProducts;
      this.toast.success("El producto se ha eliminado correctamente")
      this.confirmOpen = false;
      this.productToDelete = null;
    }
    else{
      this.toast.error("el producto a eliminar ya no existe en la base de datos, puede ser que lo hayan eliminado previamente")
      this.confirmOpen = false;
      this.productToDelete = null;
    }
      
  }
}
