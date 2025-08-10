import { Product } from 'src/app/core/models/product.model';

export interface ProductsListResponse {
  data: Product[];
}

export interface ProductCreateResponse {
  message: string;
  data: Product;
}

export interface ProductUpdateResponse {
  message: string; 
  data: Omit<Product, 'id'>;
}

export interface ProductDeleteResponse {
  message: string;
}
