import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { editAccessGuard } from 'src/app/core/guards/edit-access.guard';

import { ProductListComponent } from './presentation/pages/dashboard/product-list/product-list.component';
import { ProductCreateComponent } from './presentation/pages/dashboard/product-create/product-create.component';
import { ProductEditComponent } from './presentation/pages/dashboard/product-edit/product-edit.component';

describe('AppRoutingModule', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRoutingModule],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('debe contener ruta raíz con AdminComponent y children', () => {
    const root = router.config.find(r => r.path === '' && r.component === AdminComponent);
    expect(root).toBeTruthy();
    expect(root?.children?.length).toBeGreaterThanOrEqual(3);
  });

  it('debe tener ruta list con loadComponent', () => {
    const root = router.config.find(r => r.path === '' && r.component === AdminComponent)!;
    const list = root.children?.find(c => c.path === 'dashboard/products/list');
    expect(list).toBeTruthy();
    expect(typeof list?.loadComponent).toBe('function');
  });

  it('debe tener ruta create con loadComponent', () => {
    const root = router.config.find(r => r.path === '' && r.component === AdminComponent)!;
    const create = root.children?.find(c => c.path === 'dashboard/products/create');
    expect(create).toBeTruthy();
    expect(typeof create?.loadComponent).toBe('function');
  });

  it('debe tener ruta edit/:id con guard editAccessGuard y loadComponent', () => {
    const root = router.config.find(r => r.path === '' && r.component === AdminComponent)!;
    const edit = root.children?.find(c => c.path === 'dashboard/products/edit/:id');
    expect(edit).toBeTruthy();
    expect(typeof edit?.loadComponent).toBe('function');

    const guards = (edit?.canActivate ?? []) as any[];
    expect(Array.isArray(guards)).toBe(true);
    expect(guards).toContain(editAccessGuard);
  });

  it('debe tener redirect "" -> /dashboard/products/list con pathMatch full', () => {
    const root = router.config.find(r => r.path === '' && r.component === AdminComponent)!;
    const redirect = root.children?.find(c => c.path === '' && c.redirectTo === '/dashboard/products/list');
    expect(redirect).toBeTruthy();
    expect(redirect?.pathMatch).toBe('full');
  });

  it('loadComponent de list/create/edit resuelve al componente esperado', async () => {
    const root = router.config.find(r => r.path === '' && r.component === AdminComponent)!;

    const list = root.children?.find(c => c.path === 'dashboard/products/list');
    const listCmp = await (list!.loadComponent as () => Promise<any>)();
    expect(listCmp).toBe(ProductListComponent);

    const create = root.children?.find(c => c.path === 'dashboard/products/create');
    const createCmp = await (create!.loadComponent as () => Promise<any>)();
    expect(createCmp).toBe(ProductCreateComponent);

    const edit = root.children?.find(c => c.path === 'dashboard/products/edit/:id');
    const editCmp = await (edit!.loadComponent as () => Promise<any>)();
    expect(editCmp).toBe(ProductEditComponent);
  });
});
