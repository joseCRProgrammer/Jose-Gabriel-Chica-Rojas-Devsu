import { Product } from '../models/product.model';
import { Result } from '../types/result';

export interface ProductRepository {
  listAll(): Promise<Result<Product[]>>;

  create(product: Product): Promise<Result<Product>>;

  update(id: string, product: Omit<Product, 'id'>): Promise<Result<Product>>;

  remove(id: string): Promise<Result<void>>;

  verifyId(id: string): Promise<Result<boolean>>;
}
