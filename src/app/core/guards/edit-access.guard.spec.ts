import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { editAccessGuard } from './edit-access.guard';
import { EditIntentService } from 'src/app/shared/services/edit-intent.service';

describe('editAccessGuard (functional)', () => {
  let router: { navigate: jest.Mock };
  let editIntent: { validateAndConsume: jest.Mock };

  const makeRoute = (id?: string | null, token?: string | null) => {
    const paramMap = {
      get: (key: string) => (key === 'id' ? (id ?? null) : null),
    } as any;

    const queryParamMap = {
      get: (key: string) => (key === 'token' ? (token ?? null) : null),
    } as any;

    return {
      paramMap,
      queryParamMap,
    } as unknown as ActivatedRouteSnapshot;
  };

  const makeState = (url = '/any/url'): RouterStateSnapshot =>
    ({ url } as RouterStateSnapshot);

  beforeEach(() => {
    router = {
      navigate: jest.fn(),
    };

    editIntent = {
      validateAndConsume: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: EditIntentService, useValue: editIntent },
      ],
    });
  });

  it('retorna true cuando validateAndConsume(id, token) => true', () => {
    const route = makeRoute('abc', 'tok123');
    editIntent.validateAndConsume.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      editAccessGuard(route, makeState('/dashboard/products/edit/abc?token=tok123'))
    );

    expect(result).toBe(true);
    expect(editIntent.validateAndConsume).toHaveBeenCalledWith('abc', 'tok123');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('retorna false y navega a /dashboard/products/list cuando validateAndConsume => false', () => {
    const route = makeRoute('xyz', 't0k');
    editIntent.validateAndConsume.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      editAccessGuard(route, makeState())
    );

    expect(result).toBe(false);
    expect(editIntent.validateAndConsume).toHaveBeenCalledWith('xyz', 't0k');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/products/list']);
  });

  it('si no viene id en la ruta, usa id="" y pasa token tal cual (null)', () => {
    const route = makeRoute(null, null);
    editIntent.validateAndConsume.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      editAccessGuard(route, makeState())
    );

    expect(result).toBe(false);
    expect(editIntent.validateAndConsume).toHaveBeenCalledWith('', null);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/products/list']);
  });
});
