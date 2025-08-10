import { InjectionToken } from '@angular/core';
import { ProductRepository } from 'src/app/core/ports/product.repository';

export const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('PRODUCT_REPOSITORY');
