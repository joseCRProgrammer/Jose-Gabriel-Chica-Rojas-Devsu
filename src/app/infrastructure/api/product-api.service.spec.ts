import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductApiService } from './product-api.service';
import { Result, isOk, isErr } from 'src/app/core/types/result';

jest.mock('src/environments/environment', () => ({
  environment: { apiUrl: 'http://localhost:3002/bp' },
}));

type Product = {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
};

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:3002/bp';

  const product = (id = 'trj-crd'): Product => ({
    id,
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero',
    logo: 'https://logo.png',
    date_release: '2025-08-10',
    date_revision: '2026-08-10',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductApiService],
    });

    service = TestBed.inject(ProductApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('listAll', () => {
    it('debe retornar ok con la lista de productos', async () => {
      const promise = service.listAll();

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      const data = [product('p1'), product('p2')];
      req.flush({ data });

      const res: Result<Product[]> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value).toEqual(data);
      }
    });

    it('si la API no trae data, debe retornar ok([])', async () => {
      const promise = service.listAll();

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      req.flush({});
      const res: Result<Product[]> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value).toEqual([]);
      }
    });

    it('debe retornar err con el mensaje de e.error.errors', async () => {
      const promise = service.listAll();

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      req.flush(
        { errors: 'Listado no disponible' },
        { status: 500, statusText: 'Server Error' }
      );

      const res: Result<Product[]> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error).toBe('Listado no disponible');
      }
    });
  });

  describe('create', () => {
    it('debe POST y retornar ok(producto creado)', async () => {
      const p = product('new');

      const promise = service.create(p);

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(p);

      req.flush({ data: p });

      const res: Result<Product> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value).toEqual(p);
      }
    });

    it('debe retornar err en caso de error', async () => {
      const p = product('dup');

      const promise = service.create(p);

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('POST');

      req.flush(
        { errors: 'ID duplicado' },
        { status: 409, statusText: 'Conflict' }
      );

      const res: Result<Product> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error).toBe('ID duplicado');
      }
    });
  });

  describe('update', () => {
    it('debe PUT a /products/:id y retornar ok({id,...data})', async () => {
      const id = 'abc';
      const body = {
        name: 'Nuevo',
        description: 'Desc',
        logo: 'https://logo2.png',
        date_release: '2025-09-01',
        date_revision: '2026-09-01',
      };

      const promise = service.update(id, body);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);

      req.flush({ data: body });

      const res: Result<Product> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value).toEqual({ id, ...body });
      }
    });

    it('debe URL-encode del id', async () => {
      const id = 'a b';
      const body = {
        name: 'X',
        description: 'Y',
        logo: 'Z',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      };

      const promise = service.update(id, body);

      const encoded = 'a%20b';
      const req = httpMock.expectOne(`${base}/products/${encoded}`);
      expect(req.request.method).toBe('PUT');

      req.flush({ data: body });

      const res: Result<Product> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value.id).toBe(id);
      }
    });

    it('debe retornar err cuando la API falla', async () => {
      const id = 'abc';
      const body = {
        name: 'Nuevo',
        description: 'Desc',
        logo: 'https://logo2.png',
        date_release: '2025-09-01',
        date_revision: '2026-09-01',
      };

      const promise = service.update(id, body);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('PUT');

      req.flush(
        { errors: 'No se pudo actualizar' },
        { status: 400, statusText: 'Bad Request' }
      );

      const res: Result<Product> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error).toBe('No se pudo actualizar');
      }
    });
  });

  describe('remove', () => {
    it('debe DELETE y retornar ok(void)', async () => {
      const id = 'to-del';

      const promise = service.remove(id);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('DELETE');

      req.flush({});

      const res: Result<void> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value).toBeUndefined();
      }
    });

    it('debe retornar err si falla el delete', async () => {
      const id = 'to-del';

      const promise = service.remove(id);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(
        { errors: 'No encontrado' },
        { status: 404, statusText: 'Not Found' }
      );

      const res: Result<void> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error).toBe('No encontrado');
      }
    });
  });

  describe('verifyId', () => {
    it('debe GET y retornar ok(boolean)', async () => {
      const id = 'trj-crd';
      const promise = service.verifyId(id);

      const req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush(true);

      const res: Result<boolean> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) {
        expect(res.value).toBe(true);
      }
    });

    it('debe retornar err al fallar', async () => {
      const id = 'trj-crd';
      const promise = service.verifyId(id);

      const req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush(
        { errors: 'Fallo verificación' },
        { status: 500, statusText: 'Server Error' }
      );

      const res: Result<boolean> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error).toBe('Fallo verificación');
      }
    });
  });
});
