import { ProductRepository } from '../ports/product.repository';
import { Product } from '../models/product.model';
import { Result } from '../types/result';

export class UpdateProductUseCase {
  constructor(private readonly repo: ProductRepository) {}
  execute(id: string, p: Omit<Product, 'id'>): Promise<Result<Product>> {
    return this.repo.update(id, p);
  }
}
