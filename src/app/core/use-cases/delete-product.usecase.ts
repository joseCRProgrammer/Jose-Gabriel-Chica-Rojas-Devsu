import { ProductRepository } from '../ports/product.repository';
import { Result } from '../types/result';

export class DeleteProductUseCase {
  constructor(private readonly repo: ProductRepository) {}
  execute(id: string): Promise<Result<void>> {
    return this.repo.remove(id);
  }
}
