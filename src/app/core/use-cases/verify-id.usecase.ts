import { ProductRepository } from '../ports/product.repository';
import { Result } from '../types/result';

export class VerifyIdUseCase {
  constructor(private readonly repo: ProductRepository) {}
  execute(id: string): Promise<Result<boolean>> {
    return this.repo.verifyId(id);
  }
}
