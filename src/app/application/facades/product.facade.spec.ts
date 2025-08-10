import { TestBed } from '@angular/core/testing';
import { InjectionToken } from '@angular/core';
import { ProductFacade } from './product.facade'; // <-- ajusta esta ruta
import { PRODUCT_REPOSITORY } from '../adapter';

// IMPORTANT: mockeamos isErr para que detecte error cuando el objeto tenga __err: true
jest.mock('src/app/core/types/result', () => ({
  isErr: (res: any) => !!(res && res.__err === true),
}));

type Product = {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
};

describe('ProductFacade', () => {
  let facade: ProductFacade;

  // Un repo “dummy” solo para satisfacer el inject(PRODUCT_REPOSITORY)
  const repoMock = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductFacade,
        { provide: PRODUCT_REPOSITORY as InjectionToken<any>, useValue: repoMock },
      ],
    });

    facade = TestBed.inject(ProductFacade);

    // Sobrescribimos internamente los casos de uso con mocks controlables.
    // Nota: aunque sean "private", en runtime están accesibles como propiedades del objeto.
    (facade as any).loadAllUC = { execute: jest.fn() };
    (facade as any).createUC  = { execute: jest.fn() };
    (facade as any).updateUC  = { execute: jest.fn() };
    (facade as any).deleteUC  = { execute: jest.fn() };
    (facade as any).verifyUC  = { execute: jest.fn() };
  });

  const aProduct = (id = 'trj-crd'): Product => ({
    id,
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero',
    logo: 'https://logo.png',
    date_release: '2025-08-10',
    date_revision: '2026-08-10',
  });

  it('estado inicial: loading=false, error=null, all=[]', () => {
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.all()).toEqual([]);
  });

  describe('loadAll', () => {
    it('debe cargar productos (success) y poblar all', async () => {
      const products = [aProduct('p1'), aProduct('p2')];
      (facade as any).loadAllUC.execute.mockResolvedValue({ value: products });

      await facade.loadAll();

      expect((facade as any).loadAllUC.execute).toHaveBeenCalledTimes(1);
      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBeNull();
      expect(facade.all()).toEqual(products);
    });

    it('debe setear error cuando execute retorna Err', async () => {
      const err = { __err: true, message: 'Boom' };
      (facade as any).loadAllUC.execute.mockResolvedValue(err);

      await facade.loadAll();

      expect(facade.loading()).toBe(false);
      expect(facade.error()).toEqual(err);
      expect(facade.all()).toEqual([]);
    });
  });

  describe('create', () => {
    it('debe agregar el producto al inicio y retornar true (success)', async () => {
      // estado previo
      (facade as any)._all.set([aProduct('old')]);

      const newProd = aProduct('new');
      (facade as any).createUC.execute.mockResolvedValue({ value: newProd });

      const ok = await facade.create(newProd);

      expect(ok).toBe(true);
      expect(facade.error()).toBeNull();
      expect(facade.all()).toEqual([newProd, aProduct('old')]);
    });

    it('debe setear error y retornar false (error)', async () => {
      const err = { __err: true, message: 'Create failed' };
      (facade as any).createUC.execute.mockResolvedValue(err);

      const ok = await facade.create(aProduct('x'));

      expect(ok).toBe(false);
      expect(facade.error()).toEqual(err);
      expect(facade.all()).toEqual([]);
    });
  });

  describe('update', () => {
    it('debe actualizar el producto y retornar true (success)', async () => {
      const original = aProduct('p1');
      (facade as any)._all.set([original, aProduct('p2')]);

      const updated: Product = { ...original, name: 'Nuevo nombre' };
      (facade as any).updateUC.execute.mockResolvedValue({ value: updated });

      const ok = await facade.update('p1', {
        name: updated.name,
        description: updated.description,
        logo: updated.logo,
        date_release: updated.date_release,
        date_revision: updated.date_revision,
      });

      expect(ok).toBe(true);
      const all = facade.all();
      expect(all[0]).toEqual(updated);
      expect(all[1]).toEqual(aProduct('p2'));
    });

    it('debe setear error y retornar false (error)', async () => {
      const err = { __err: true, message: 'Update failed' };
      (facade as any)._all.set([aProduct('p1')]);
      (facade as any).updateUC.execute.mockResolvedValue(err);

      const ok = await facade.update('p1', {
        name: 'X',
        description: 'Y',
        logo: 'z',
        date_release: '2025-08-10',
        date_revision: '2026-08-10',
      });

      expect(ok).toBe(false);
      expect(facade.error()).toEqual(err);
      // no debe cambiar la lista
      expect(facade.all()).toEqual([aProduct('p1')]);
    });
  });

  describe('remove', () => {
    it('debe eliminar el producto y retornar true (success)', async () => {
      (facade as any)._all.set([aProduct('p1'), aProduct('p2')]);

      // Para success, la fachada no usa res.value; solo verifica que NO sea Err
      (facade as any).deleteUC.execute.mockResolvedValue({});

      const ok = await facade.remove('p1');

      expect(ok).toBe(true);
      expect(facade.all()).toEqual([aProduct('p2')]);
    });

    it('debe setear error y retornar false (error)', async () => {
      (facade as any)._all.set([aProduct('p1'), aProduct('p2')]);

      const err = { __err: true, message: 'Delete failed' };
      (facade as any).deleteUC.execute.mockResolvedValue(err);

      const ok = await facade.remove('p1');

      expect(ok).toBe(false);
      expect(facade.error()).toEqual(err);
      // lista intacta
      expect(facade.all()).toEqual([aProduct('p1'), aProduct('p2')]);
    });
  });

  describe('verifyId', () => {
    it('debe devolver el value cuando ok=true', async () => {
      (facade as any).verifyUC.execute.mockResolvedValue({ ok: true, value: false });
      await expect(facade.verifyId('abc')).resolves.toBe(false);

      (facade as any).verifyUC.execute.mockResolvedValue({ ok: true, value: true });
      await expect(facade.verifyId('def')).resolves.toBe(true);
    });

    it('si el result no es ok, debe devolver true por defecto', async () => {
      (facade as any).verifyUC.execute.mockResolvedValue({ ok: false, reason: 'err' });
      await expect(facade.verifyId('ghi')).resolves.toBe(true);
    });
  });

  describe('getByIdLocal', () => {
    it('debe devolver el producto si existe', () => {
      const p = aProduct('p9');
      (facade as any)._all.set([aProduct('p1'), p]);
      expect(facade.getByIdLocal('p9')).toEqual(p);
    });

    it('debe devolver undefined si no existe', () => {
      (facade as any)._all.set([aProduct('p1')]);
      expect(facade.getByIdLocal('nope')).toBeUndefined();
    });
  });

  it('clearError debe poner error en null', () => {
    (facade as any)._error.set({ any: 'thing' });
    facade.clearError();
    expect(facade.error()).toBeNull();
  });
});
