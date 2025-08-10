import { Injectable, computed, inject, signal } from '@angular/core';
import { PRODUCT_REPOSITORY } from '../adapter';

import { LoadAllProductsUseCase } from 'src/app/core/use-cases/load-all-products.usecase';
import { CreateProductUseCase } from 'src/app/core/use-cases/create-product.usecase';
import { UpdateProductUseCase } from 'src/app/core/use-cases/update-product.usecase';
import { DeleteProductUseCase } from 'src/app/core/use-cases/delete-product.usecase';
import { VerifyIdUseCase } from 'src/app/core/use-cases/verify-id.usecase';

import { Product } from 'src/app/core/models/product.model';
import { isErr } from 'src/app/core/types/result';


@Injectable({ providedIn: 'root' })
export class ProductFacade {
  // Infra (inyectada)
  private repo = inject(PRODUCT_REPOSITORY);

  // Casos de uso
  private loadAllUC = new LoadAllProductsUseCase(this.repo);
  private createUC  = new CreateProductUseCase(this.repo);
  private updateUC  = new UpdateProductUseCase(this.repo);
  private deleteUC  = new DeleteProductUseCase(this.repo);
  private verifyUC  = new VerifyIdUseCase(this.repo);

  // Estado
  private _loading = signal(false);
  private _error   = signal<Object | null>(null);
  private _all     = signal<Product[]>([]);

  // Selectores
  readonly loading = computed(() => this._loading());
  readonly error   = computed(() => this._error());
  readonly all     = computed(() => this._all());

  //proocesos que comunicará la capa de presentación
  async loadAll(): Promise<void> {
    this._loading.set(true); this._error.set(null);
    const res = await this.loadAllUC.execute();
    this._loading.set(false);
    if (isErr(res)) { this._error.set(res); return; }
    this._all.set(res.value);
  }

  async create(p: Product): Promise<boolean> {
    this._loading.set(true); this._error.set(null);
    const res = await this.createUC.execute(p);
    this._loading.set(false);
    if (isErr(res)) { this._error.set(res); return false; }
    this._all.set([res.value, ...this._all()]);
    return true;
  }

  async update(id: string, p: Omit<Product,'id'>): Promise<boolean> {
    this._loading.set(true); this._error.set(null);
    const res = await this.updateUC.execute(id, p);
    this._loading.set(false);
    if (isErr(res)) { this._error.set(res); return false; }
    this._all.set(this._all().map(x => x.id === id ? res.value : x));
    return true;
  }

  async remove(id: string): Promise<boolean> {
    this._loading.set(true); this._error.set(null);
    const res = await this.deleteUC.execute(id);
    this._loading.set(false);
    if (isErr(res)) { this._error.set(res); return false; }
    this._all.set(this._all().filter(x => x.id !== id));
    return true;
  }

  async verifyId(id: string): Promise<boolean> {
    const r = await this.verifyUC.execute(id);
    return r.ok ? r.value : true;
  }

  getByIdLocal(id: string): Product | undefined {
    return this._all().find(p => p.id === id);
  }

  clearError(): void { this._error.set(null); }
}
