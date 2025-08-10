import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProductCreateComponent } from './product-create.component';
import { Product } from 'src/app/core/models/product.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProductCreateComponent', () => {
  let component: ProductCreateComponent;

  const routerMock = { navigate: jest.fn() };
  const toastMock = { success: jest.fn(), error: jest.fn() };

  const facadeMock = {
    verifyId: jest.fn<Promise<boolean>, [string]>(),
    create: jest.fn<Promise<boolean>, [Product]>(),
    clearError: jest.fn(),
    loading: jest.fn(() => false),
    error: jest.fn(() => null),
  };

  const aProduct = (id = 'trj-crd'): Product => ({
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
      imports: [ProductCreateComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: 'ProductFacade', useValue: facadeMock },
        { provide: (require('src/app/application/facades/product.facade').ProductFacade), useValue: facadeMock },
        { provide: (require('src/app/shared/components/toast/toast.service').ToastService), useValue: toastMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(ProductCreateComponent, {
      set: { template: '<div></div>' },
    });

    const fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;
  });

  it('si el ID existe, muestra toast.error y NO llama create ni navigate', async () => {
    facadeMock.verifyId.mockResolvedValue(true);

    await component.onCreate(aProduct('dup-id'));

    expect(facadeMock.verifyId).toHaveBeenCalledWith('dup-id');
    expect(toastMock.error).toHaveBeenCalledWith(
      'El producto "dup-id" ya existe en la base de datos'
    );
    expect(facadeMock.create).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('creación exitosa: muestra toast.success y navega a la lista', async () => {
    facadeMock.verifyId.mockResolvedValue(false); 
    facadeMock.create.mockResolvedValue(true);

    await component.onCreate(aProduct('new-id'));

    expect(facadeMock.verifyId).toHaveBeenCalledWith('new-id');
    expect(facadeMock.create).toHaveBeenCalled();
    expect(toastMock.success).toHaveBeenCalledWith('Producto creado con éxito');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/products/list']);
  });

  it('creación falla: arma summary desde constraints, muestra toast.error y limpia error', async () => {
    facadeMock.verifyId.mockResolvedValue(false);
    facadeMock.create.mockResolvedValue(false);

    const errPayload = {
      error: [
        { constraints: { c1: 'Name required', c2: 'Name length >= 5' } },
        { constraints: { c3: 'Logo is required' } },
        { constraints: { c4: 'Extra (no debería aparecer por slice(0,3))' } },
      ],
    };
    facadeMock.error.mockReturnValue(errPayload);

    await component.onCreate(aProduct('bad-id'));

    expect(facadeMock.create).toHaveBeenCalled();
    const expectedSummary = 'Name required | Name length >= 5 | Logo is required';
    expect(toastMock.error).toHaveBeenCalledWith(
      `Error en el servidor Validación: ${expectedSummary}`
    );
    expect(facadeMock.clearError).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('creación falla con payload no-array: usa mensaje por defecto', async () => {
    facadeMock.verifyId.mockResolvedValue(false);
    facadeMock.create.mockResolvedValue(false);

    facadeMock.error.mockReturnValue({ error: 'any-scalar' });

    await component.onCreate(aProduct('bad2'));

    expect(toastMock.error).toHaveBeenCalledWith(
      'Error en el servidor Validación: Revisa los campos marcados.'
    );
    expect(facadeMock.clearError).toHaveBeenCalled();
  });
});
