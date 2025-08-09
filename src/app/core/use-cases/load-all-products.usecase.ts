import { ProductRepository } from '../ports/product.repository';
import { Product } from '../models/product.model';
import { Result } from '../types/result';

export class LoadAllProductsUseCase {
  constructor(private readonly repo: ProductRepository) {}
  execute(): Promise<Result<Product[]>> {
    return this.repo.listAll();
  }
}
