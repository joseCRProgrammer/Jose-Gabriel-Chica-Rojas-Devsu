import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from 'src/app/shared/models/product.model';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductTable, TableColumn } from 'src/app/shared/product-table/product-table';
import { SearchBox } from 'src/app/shared/search-box/search-box';
import { ButtonComponent } from 'src/app/shared/button/button';
import { Router } from '@angular/router';
import { ModalComponent } from 'src/app/shared/modal/modal';

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

  loading = false;
  errorMsg: string | null = null;

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
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.allProducts = this.mock50();
    this.filteredProducts = [...this.allProducts];
  }

   private mock50(): Product[] {
    return Array.from({ length: 50 }, (_, i) => {
      const num = i + 1;
      const idPrefix = ['trj-crd', 'cta-aho', 'inv-fnd', 'prst-hip', 'seg-vid'][i % 5];
      const yearRelease = 2005 + (i % 15);
      const yearRevision = yearRelease + 1;
      const month = String((i % 12) + 1).padStart(2, '0');

      return {
        id: `${idPrefix}-${num.toString().padStart(3, '0')}`,
        name: `Nombre del producto ${num}`,
        description: `Descripción del producto ${num}`,
        logo: `https://picsum.photos/seed/p${num}/48/48`,

        date_release: `${yearRelease}-${month}-01`,
        date_revision: `${yearRevision}-${month}-01`
      };
    });
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

  onAction(ev: { actionId: string; row: Product }) {
    if (ev.actionId === 'delete') {
      this.productToDelete = ev.row;
      this.confirmOpen = true;
    }
    if (ev.actionId === 'edit') {
      this.router.navigate(['/dashboard/products/edit', ev.row.id]);
    }
  }

    cancelDelete() {
    this.confirmOpen = false;
    this.productToDelete = null;
  }

  confirmDelete() {
    if (!this.productToDelete) return;
    const id = this.productToDelete.id;
    this.allProducts = this.allProducts.filter(p => p.id !== id);
    this.confirmOpen = false;
    this.productToDelete = null;
  }
}
