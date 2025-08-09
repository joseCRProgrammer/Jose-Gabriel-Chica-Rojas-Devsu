import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ProductRepository } from 'src/app/core/ports/product.repository';
import { Product } from 'src/app/core/models/product.model';
import { Result, ok, err } from 'src/app/core/types/result';

import {
  ProductsListResponse,
  ProductCreateResponse,
  ProductUpdateResponse,
  ProductDeleteResponse
} from './dto/product.api.dto';

import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductApiService implements ProductRepository {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async listAll(): Promise<Result<Product[]>> {
    try {
      const res = await firstValueFrom(
        this.http.get<ProductsListResponse>(`${this.base}/products`)
      );
      return ok(res.data ?? []);
    } catch (e: any) {
      return err(this.extractError(e));
    }
  }

  async create(product: Product): Promise<Result<Product>> {
    try {
      const res = await firstValueFrom(
        this.http.post<ProductCreateResponse>(`${this.base}/products`, product)
      );
      return ok(res.data);
    } catch (e: any) {
      return err(this.extractError(e));
    }
  }

  async update(id: string, product: Omit<Product, 'id'>): Promise<Result<Product>> {
    try {
      const res = await firstValueFrom(
        this.http.put<ProductUpdateResponse>(`${this.base}/products/${encodeURIComponent(id)}`, product)
      );
      const merged: Product = { id, ...res.data };
      return ok(merged);
    } catch (e: any) {
      return err(this.extractError(e));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      await firstValueFrom(
        this.http.delete<ProductDeleteResponse>(`${this.base}/products/${encodeURIComponent(id)}`)
      );
      return ok<void>(undefined);
    } catch (e: any) {
      return err(this.extractError(e));
    }
  }

  async verifyId(id: string): Promise<Result<boolean>> {
    try {
      const exists = await firstValueFrom(
        this.http.get<boolean>(`${this.base}/products/verification/${encodeURIComponent(id)}`)
      );
      return ok(Boolean(exists));
    } catch (e: any) {
      return err(this.extractError(e));
    }
  }

  
  private extractError(e: any): string {
    return e?.error?.errors ?? e?.errors ?? 'Unexpected error';
  }
}
