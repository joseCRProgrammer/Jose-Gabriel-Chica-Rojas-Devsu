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
    it('ok con lista de productos', async () => {
      const promise = service.listAll();
      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      const data = [product('p1'), product('p2')];
      req.flush({ data });

      const res: Result<Product[]> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toEqual(data);
    });

    it('sin data → ok([])', async () => {
      const promise = service.listAll();
      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      req.flush({});
      const res: Result<Product[]> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toEqual([]);
    });

    it('error anidado e.error.errors', async () => {
      const promise = service.listAll();
      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      req.flush({ error: { errors: 'Unexpected error' } }, { status: 500, statusText: 'Server Error' });

      const res: Result<Product[]> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Unexpected error');
    });

    it('error plano e.errors', async () => {
      const promise = service.listAll();
      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      req.flush({ errors: 'Listado no disponible' }, { status: 500, statusText: 'Server Error' });

      const res: Result<Product[]> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Listado no disponible');
    });

    it('error sin mensaje → "Unexpected error"', async () => {
      const promise = service.listAll();
      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('GET');

      req.flush({}, { status: 500, statusText: 'Server Error' });

      const res: Result<Product[]> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Unexpected error');
    });
  });

  describe('create', () => {
    it('POST ok(producto)', async () => {
      const p = product('new');
      const promise = service.create(p);

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(p);

      req.flush({ data: p });

      const res: Result<Product> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toEqual(p);
    });

    it('err plano e.errors', async () => {
      const p = product('dup');
      const promise = service.create(p);

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('POST');

      req.flush({ errors: 'ID duplicado' }, { status: 409, statusText: 'Conflict' });

      const res: Result<Product> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('ID duplicado');
    });

    it('err anidado e.error.errors', async () => {
      const p = product('dup2');
      const promise = service.create(p);

      const req = httpMock.expectOne(`${base}/products`);
      expect(req.request.method).toBe('POST');

      req.flush({ error: { errors: 'Unexpected error' } }, { status: 400, statusText: 'Bad Request' });

      const res: Result<Product> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Unexpected error');
    });
  });

  describe('update', () => {
    it('PUT /products/:id → ok({id,...data})', async () => {
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
      if (isOk(res)) expect(res.value).toEqual({ id, ...body });
    });

    it('URL-encode del id', async () => {
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
      if (isOk(res)) expect(res.value.id).toBe(id);
    });

    it('merge fuerza id del path aunque backend devuelva otro id', async () => {
      const id = 'other-id';
      const body = {
        name: 'N',
        description: 'D',
        logo: 'L',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      };

      const promise = service.update(id, body);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('PUT');

      // Backend malicioso que intenta cambiar id
      req.flush({ data: { ...body, id: 'other-id' } });

      const res: Result<Product> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value.id).toBe('other-id');
    });

    it('error plano → err', async () => {
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

      req.flush({ errors: 'No se pudo actualizar' }, { status: 400, statusText: 'Bad Request' });

      const res: Result<Product> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('No se pudo actualizar');
    });
  });

  describe('remove', () => {
    it('DELETE ok(void)', async () => {
      const id = 'to-del';

      const promise = service.remove(id);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('DELETE');

      req.flush({});

      const res: Result<void> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toBeUndefined();
    });

    it('err plano e.errors', async () => {
      const id = 'to-del';

      const promise = service.remove(id);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('DELETE');

      req.flush({ errors: 'No encontrado' }, { status: 404, statusText: 'Not Found' });

      const res: Result<void> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('No encontrado');
    });

    it('err sin mensaje → "Unexpected error"', async () => {
      const id = 'to-del-2';

      const promise = service.remove(id);

      const req = httpMock.expectOne(`${base}/products/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('DELETE');

      req.flush({}, { status: 500, statusText: 'Server Error' });

      const res: Result<void> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Unexpected error');
    });
  });

  describe('verifyId', () => {
    it('GET ok(true)', async () => {
      const id = 'trj-crd';
      const promise = service.verifyId(id);

      const req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush(true);

      const res: Result<boolean> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toBe(true);
    });

    it('GET ok(false) con false literal', async () => {
      const id = 'x';
      const promise = service.verifyId(id);

      const req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush(false);

      const res: Result<boolean> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toBe(false);
    });

    it('GET ok(false) con 0 y null (Boolean(exists))', async () => {
      // 0
      let promise = service.verifyId('z0');
      let req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent('z0')}`);
      expect(req.request.method).toBe('GET');
      req.flush(0);
      let res: Result<boolean> = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toBe(false);

      // null
      promise = service.verifyId('z1');
      req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent('z1')}`);
      expect(req.request.method).toBe('GET');
      req.flush(null);
      res = await promise;
      expect(isOk(res)).toBe(true);
      if (isOk(res)) expect(res.value).toBe(false);
    });

    it('err plano', async () => {
      const id = 'trj-crd';
      const promise = service.verifyId(id);

      const req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush({ errors: 'Fallo verificación' }, { status: 500, statusText: 'Server Error' });

      const res: Result<boolean> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Fallo verificación');
    });

    it('err anidado e.error.errors', async () => {
      const id = 'trj-crd2';
      const promise = service.verifyId(id);

      const req = httpMock.expectOne(`${base}/products/verification/${encodeURIComponent(id)}`);
      expect(req.request.method).toBe('GET');

      req.flush({ error: { errors: 'Unexpected error' } }, { status: 503, statusText: 'Service Unavailable' });

      const res: Result<boolean> = await promise;
      expect(isErr(res)).toBe(true);
      if (isErr(res)) expect(res.error).toBe('Unexpected error');
    });
  });
});
