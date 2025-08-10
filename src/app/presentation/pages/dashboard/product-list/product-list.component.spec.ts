import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { ProductListComponent } from './product-list.component';
import { ProductFacade } from 'src/app/application/facades/product.facade';
import { EditIntentService } from 'src/app/shared/services/edit-intent.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { Product } from 'src/app/core/models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;

  const routerMock = { navigate: jest.fn() };
  const toastMock = { success: jest.fn(), error: jest.fn() };

  const facadeMock: any = {
    loading: jest.fn(() => false),
    loadAll: jest.fn<Promise<void>, []>(),
    all: jest.fn<Product[], []>(),
    verifyId: jest.fn<Promise<boolean>, [string]>(),
    remove: jest.fn<Promise<boolean>, [string]>(),
  };

  const editIntentMock = {
    allowOnce: jest.fn((id: string) => `token-${id}`),
  };

  const aProduct = (id = 'p1'): Product => ({
    id,
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero',
    logo: 'https://logo.png',
    date_release: '2025-08-10',
    date_revision: '2026-08-10',
  });

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ProductFacade, useValue: facadeMock },
        { provide: EditIntentService, useValue: editIntentMock },
        { provide: ToastService, useValue: toastMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(ProductListComponent, {
      set: { template: '<div></div>' },
    });

    const fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('ngOnInit llama a loadProducts', async () => {
    const spy = jest.spyOn(component, 'loadProducts').mockResolvedValue();
    await component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('loadProducts: carga productos, clona filteredProducts y no comparte referencia', async () => {
    const list = [aProduct('p1'), aProduct('p2')];
    facadeMock.loadAll.mockResolvedValue(undefined);
    facadeMock.all.mockReturnValue(list);

    await component.loadProducts();

    expect(facadeMock.loadAll).toHaveBeenCalledTimes(1);
    expect(facadeMock.all).toHaveBeenCalledTimes(1);
    expect(component.allProducts).toEqual(list);
    expect(component.filteredProducts).toEqual(list);
    expect(component.filteredProducts).not.toBe(list); // referencia distinta
  });

  it('onSearch: si no hay table/applyFilter, no revienta (rama falsy)', () => {
    expect(() => component.onSearch('algo')).not.toThrow();
  });

  it('onDelete: confirm === false (early return)', () => {
    const spy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    expect(component.onDelete(aProduct('x'))).toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('onDelete: confirm === true (rama else, sin efectos posteriores)', () => {
    const spy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    expect(component.onDelete(aProduct('y'))).toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('onAction: acción desconocida -> no cambia estado', () => {
    const snapshot = {
      confirmOpen: component.confirmOpen,
      productToDelete: component.productToDelete,
    };

    component.onAction({ actionId: 'unknown', row: aProduct('u1') });

    expect(component.confirmOpen).toBe(snapshot.confirmOpen);
    expect(component.productToDelete).toBe(snapshot.productToDelete);
  });

  it('onSearch: llama a table.applyFilter si existe', () => {
    const applyFilter = jest.fn();
    (component as any).table = { applyFilter };
    component.onSearch('abc');
    expect(applyFilter).toHaveBeenCalledWith('abc');
  });

  it('onAddProduct: navega a /dashboard/products/create', () => {
    component.onAddProduct();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/products/create']);
  });

  it('onAction(delete): setea productToDelete y abre confirmación', () => {
    const row = aProduct('del-1');

    component.onAction({ actionId: 'delete', row });

    expect(component.productToDelete).toEqual(row);
    expect(component.confirmOpen).toBe(true);
  });

  it('onAction(edit): verifyId truthy (Promise) → navega con token', () => {
    const row = aProduct('e1');
    // Como el código no hace await, con Promise (truthy) toma la rama "existe"
    facadeMock.verifyId.mockResolvedValue(true);
    editIntentMock.allowOnce.mockReturnValue('tok123');

    component.onAction({ actionId: 'edit', row });

    expect(editIntentMock.allowOnce).toHaveBeenCalledWith('e1');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/dashboard/products/edit', 'e1'],
      { queryParams: { token: 'tok123' } }
    );
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it('onAction(edit): verifyId falso inmediato → muestra toast.error y NO navega (rama else)', () => {
    const row = aProduct('no-exist');
    // Fuerza rama else devolviendo false inmediato (no Promise)
    facadeMock.verifyId.mockReturnValue(false as any);

    component.onAction({ actionId: 'edit', row });

    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalledWith(
      'El producto a editar ya no existe, puede ser que lo hayan eliminado previamente'
    );
  });

  it('cancelDelete: cierra modal y limpia selección', () => {
    component.confirmOpen = true;
    component.productToDelete = aProduct('x');

    component.cancelDelete();

    expect(component.confirmOpen).toBe(false);
    expect(component.productToDelete).toBeNull();
  });

  it('confirmDelete: early return si no hay productToDelete', async () => {
    component.productToDelete = null;
    await component.confirmDelete();
    expect(facadeMock.verifyId).not.toHaveBeenCalled();
    expect(facadeMock.remove).not.toHaveBeenCalled();
  });

  it('confirmDelete: existe (verifyId=>true) → elimina, actualiza arrays y success', async () => {
    const p1 = aProduct('a');
    const p2 = aProduct('b');
    component.allProducts = [p1, p2];
    component.filteredProducts = [p1, p2];
    component.productToDelete = p1;
    component.confirmOpen = true;

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.remove.mockResolvedValue(true);

    await component.confirmDelete();

    expect(facadeMock.verifyId).toHaveBeenCalledWith('a');
    expect(facadeMock.remove).toHaveBeenCalledWith('a');

    expect(component.allProducts).toEqual([p2]);
    expect(component.filteredProducts).toEqual([p2]);

    expect(toastMock.success).toHaveBeenCalledWith('El producto se ha eliminado correctamente');
    expect(component.confirmOpen).toBe(false);
    expect(component.productToDelete).toBeNull();
  });

  it('confirmDelete: NO existe (verifyId=>false) → toast.error, no cambia arrays', async () => {
    const p1 = aProduct('a');
    const snapshotAll = [p1];
    component.allProducts = [...snapshotAll];
    component.filteredProducts = [...snapshotAll];
    component.productToDelete = p1;
    component.confirmOpen = true;

    facadeMock.verifyId.mockResolvedValue(false);

    await component.confirmDelete();

    expect(facadeMock.verifyId).toHaveBeenCalledWith('a');
    expect(facadeMock.remove).not.toHaveBeenCalled();

    expect(component.allProducts).toEqual(snapshotAll);
    expect(component.filteredProducts).toEqual(snapshotAll);

    expect(toastMock.error).toHaveBeenCalledWith(
      'el producto a eliminar ya no existe en la base de datos, puede ser que lo hayan eliminado previamente'
    );
    expect(component.confirmOpen).toBe(false);
    expect(component.productToDelete).toBeNull();
  });
});
