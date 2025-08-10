import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ProductEditComponent } from './product-edit.component';
import { ProductFacade } from 'src/app/application/facades/product.facade';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { Product } from 'src/app/core/models/product.model';

describe('ProductEditComponent', () => {
  let component: ProductEditComponent;

  const routerMock = { navigate: jest.fn() };
  const toastMock = { success: jest.fn(), error: jest.fn() };

  const facadeMock: any = {
    getByIdLocal: jest.fn< Product | undefined, [string] >(),
    verifyId: jest.fn< Promise<boolean>, [string] >(),
    update: jest.fn< Promise<boolean>, [string, Omit<Product, 'id'>] >(),
    clearError: jest.fn(),
    error: jest.fn(() => null),
    _error: { set: jest.fn() },
  };

  const aProduct = (id = 'p1'): Product => ({
    id,
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero',
    logo: 'https://logo.png',
    date_release: '2025-08-10',
    date_revision: '2026-08-10',
  });

  const makeActivatedRoute = (id = 'p1') =>
    ({
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? id : null),
        },
      },
    } as unknown as ActivatedRoute);

  function setupRoute(id = 'p1') {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProductEditComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ProductFacade, useValue: facadeMock },
        { provide: ToastService, useValue: toastMock },
        { provide: ActivatedRoute, useValue: makeActivatedRoute(id) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideComponent(ProductEditComponent, {
      set: { template: '<div></div>' },
    });
    const fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
    return fixture;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setupRoute('p1').detectChanges();
  });

  it('ngOnInit: carga id desde la ruta y obtiene el producto local', () => {
    const prod = aProduct('p1');
    facadeMock.getByIdLocal.mockReturnValue(prod);

    component.ngOnInit();

    expect(facadeMock.getByIdLocal).toHaveBeenCalledWith('p1');
    expect(component.product).toEqual(prod);
  });

  it('ngOnInit: si no existe localmente, deja product como undefined', () => {
    facadeMock.getByIdLocal.mockReturnValue(undefined);

    component.ngOnInit();

    expect(facadeMock.getByIdLocal).toHaveBeenCalledWith('p1');
    expect(component.product).toBeUndefined();
  });

  it('onUpdate: si verifyId => false (no existe), muestra toast.error y NO actualiza ni navega', async () => {
    const p = aProduct('no-exist');
    facadeMock.verifyId.mockResolvedValue(false);

    await component.onUpdate(p);

    expect(facadeMock.verifyId).toHaveBeenCalledWith('no-exist');
    expect(facadeMock.clearError).toHaveBeenCalled();

    const msg = `El producto "no-exist" no existe o fue borrado recientemente`;
    expect(facadeMock._error.set).toHaveBeenCalledWith(msg);
    expect(toastMock.error).toHaveBeenCalledWith(msg);

    expect(facadeMock.update).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('onUpdate: éxito (verifyId => true, update => true): toast.success + navigate', async () => {
    const currentId = 'p1';
    const p = aProduct(currentId);

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(true);

    await component.onUpdate(p);

    expect(facadeMock.verifyId).toHaveBeenCalledWith(currentId);

    expect(facadeMock.update).toHaveBeenCalledWith(
      currentId,
      expect.objectContaining({
        name: p.name,
        description: p.description,
        logo: p.logo,
        date_release: p.date_release,
        date_revision: p.date_revision,
      })
    );

    expect(toastMock.success).toHaveBeenCalledWith('Producto actualizado con éxito');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/products/list']);
    expect(facadeMock._error.set).not.toHaveBeenCalled();
  });

  it('onUpdate: usa el id de la ruta para update incluso si p.id es distinto', async () => {
    setupRoute('route-123').detectChanges();
    const p = aProduct('payload-999');

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(true);

    await component.onUpdate(p);

    expect(facadeMock.verifyId).toHaveBeenCalledWith('payload-999');
    expect(facadeMock.update).toHaveBeenCalledWith('route-123', expect.any(Object));
  });

  it('onUpdate: falla (verifyId => true, update => false): arma summary, toast.error y clearError', async () => {
    const p = aProduct('p1');

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(false);

    facadeMock.error.mockReturnValue({
      error: [
        { constraints: { c1: 'Name required', c2: 'Name length >= 5' } },
        { constraints: { c3: 'Logo is required' } },
        { constraints: { c4: 'Another message (no debe mostrarse por slice 0..3)' } },
      ],
    });

    await component.onUpdate(p);

    const expectedSummary = 'Name required | Name length >= 5 | Logo is required';
    expect(toastMock.error).toHaveBeenCalledWith(
      `Error en el servidor Validación: ${expectedSummary}`
    );
    expect(facadeMock.clearError).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(facadeMock._error.set).not.toHaveBeenCalled();
  });

  it('onUpdate: falla con payload no-array: usa mensaje por defecto', async () => {
    const p = aProduct('p1');

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(false);
    facadeMock.error.mockReturnValue({ error: 'scalar' });

    await component.onUpdate(p);

    expect(toastMock.error).toHaveBeenCalledWith(
      'Error en el servidor Validación: Revisa los campos marcados.'
    );
    expect(facadeMock.clearError).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(facadeMock._error.set).not.toHaveBeenCalled();
  });


  it('onUpdate: update => false con error() === null → mensaje por defecto', async () => {
    const p = aProduct('p1');

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(false);
    facadeMock.error.mockReturnValue(null);

    await component.onUpdate(p);

    expect(toastMock.error).toHaveBeenCalledWith(
      'Error en el servidor Validación: Revisa los campos marcados.'
    );
    expect(facadeMock.clearError).toHaveBeenCalled();
    expect(facadeMock._error.set).not.toHaveBeenCalled();
  });

  it('onUpdate: update => false con error.error = [] (array vacío) → summary vacío', async () => {
    const p = aProduct('p1');

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(false);
    facadeMock.error.mockReturnValue({ error: [] });

    await component.onUpdate(p);

    expect(toastMock.error).toHaveBeenCalledWith('Error en el servidor Validación: ');
    expect(facadeMock.clearError).toHaveBeenCalled();
  });

  it('onUpdate: update => false con elementos sin constraints válidos → summary vacío', async () => {
    const p = aProduct('p1');

    facadeMock.verifyId.mockResolvedValue(true);
    facadeMock.update.mockResolvedValue(false);
    facadeMock.error.mockReturnValue({ error: [{}, { constraints: {} }] });

    await component.onUpdate(p);

    expect(toastMock.error).toHaveBeenCalledWith('Error en el servidor Validación: ');
    expect(facadeMock.clearError).toHaveBeenCalled();
  });
});
