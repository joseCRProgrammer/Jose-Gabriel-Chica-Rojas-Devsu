import { ProductRepository } from '../ports/product.repository';
import { Product } from '../models/product.model';
import { Result } from '../types/result';

export class CreateProductUseCase {
  constructor(private readonly repo: ProductRepository) {}
  execute(p: Product): Promise<Result<Product>> {
    return this.repo.create(p);
  }
}
